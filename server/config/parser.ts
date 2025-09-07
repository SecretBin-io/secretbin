import { EncryptionAlgorithm } from "@nihility-io/crypto"
import z, { ZodType } from "@zod/zod"
import { parseDuration, sizeToBytes } from "utils/helpers"
import { renderMarkdown } from "./markdown.ts"
import { Config } from "./types.ts"

/**
 * Record where the keys are the languages codes and the value are the
 * string in that respective language
 */
export const TranslatedString = z.record(
	z.string(),
	z.union([
		z.string(),
		z.strictObject({ file: z.string() })
			.transform(({ file }) => renderMarkdown(file)),
	]),
)

const Duration = z.stringFormat("expires", /^(\d+)(min|hr|d|w|m|y)$/, {
	error: "Invalid expires format. Expected: <num>(min|hr|d|w|m|y) e.g 5min",
})

const Size = z.stringFormat("size", /^(\d+)(Ki|Mi|Gi|K|M|G)$/, {
	error: "Invalid size. Expected: positive integer or string with format <num>(Ki|Mi|Gi|K|M|G) e.g 10Gi",
})

export const ConfigModel: ZodType<Config> = z.strictObject({
	banner: z.strictObject({
		enabled: z.boolean().default(false),
		type: z.enum(["info", "warning", "error"]).default("info"),
		text: TranslatedString.default({ en: "Hello World!" }),
	}).prefault({}),
	branding: z.object({
		appName: z.string().default("SecretBin"),
		footer: z.string().default("Nihility.io"),
		terms: z.strictObject({
			title: TranslatedString,
			content: TranslatedString,
		}).optional(),
		links: z.strictObject({
			name: TranslatedString,
			link: TranslatedString,
		}).array().default([{
			name: { en: "GitHub" },
			link: { en: "https://github.com/Nihility-io/SecretBin" },
		}]),
		showLogo: z.boolean().default(true),
		invertLogo: z.boolean().default(false),
		showTerms: z.boolean().default(true),
	}).prefault({}),
	defaults: z.strictObject({
		expires: Duration.default("2w"),
		burn: z.boolean().default(true),
		showPassword: z.boolean().default(false),
	}).prefault({}),
	expires: Duration.array().transform((keys) =>
		keys.reduce((res, name) => ({ ...res, [name]: parseDuration(name) }), {})
	).prefault(["5min", "1hr", "1d", "1w", "2w", "1m"]),
	logging: z.strictObject({
		level: z.enum(["debug", "info", "warning", "error", "fatal"]).default("info"),
		mode: z.enum(["text", "json"]).default("text"),
		logAccess: z.boolean().default(false),
	}).prefault({}),
	policy: z.strictObject({
		requireBurn: z.boolean().default(false),
		requirePassword: z.boolean().default(false),
		denySlowBurn: z.boolean().default(false),
		encryptionAlgorithm: z.enum(EncryptionAlgorithm).default(EncryptionAlgorithm.AES256GCM),
	}).prefault({}),
	storage: z.strictObject({
		maxSize: Size.transform(sizeToBytes).or(z.uint32()).default(sizeToBytes("10Mi")),
		garbageCollection: z.strictObject({
			cron: z.string().default("* * * * *"),
		}).prefault({}),
		database: z.strictObject({
			host: z.string().default(""),
			port: z.number().default(5432),
			database: z.string().default(""),
			username: z.string().default(""),
			password: z.string().default(""),
			tls: z.enum(["require", "prefer", "off"]).default("off"),
		}).prefault({}),
	}).prefault({}),
}).prefault({})
