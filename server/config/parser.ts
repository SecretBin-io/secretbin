import z, { ZodType } from "@zod/zod"
import { EncryptionAlgorithm } from "lib/crypto"
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

/**
 * Automatically converts strings and numbers into booleans
 */
const BooleanLike = z.union([
	z.boolean(),
	z.number().transform((x) => x === 1),
	z.string().transform((x) => x.toLowerCase() === "true" || x.toLowerCase() === "yes" || x === "1"),
])

export const ConfigModel: ZodType<Config> = z.strictObject({
	banner: z.strictObject({
		enabled: BooleanLike.default(false),
		type: z.enum(["info", "warning", "error"]).default("info"),
		text: TranslatedString.default({ en: "Hello World!" }),
	}).prefault({}),
	branding: z.object({
		appName: z.string().default("SecretBin"),
		footer: z.string().default("SecretBin"),
		terms: z.strictObject({
			title: TranslatedString,
			content: TranslatedString,
		}).optional(),
		links: z.strictObject({
			name: TranslatedString,
			link: TranslatedString,
		}).array().default([{
			name: { en: "GitHub" },
			link: { en: "https://github.com/secretbin-io/secretbin" },
		}]),
		showLogo: BooleanLike.default(true),
		invertLogo: BooleanLike.default(false),
		showTerms: BooleanLike.default(true),
	}).prefault({}),
	defaults: z.strictObject({
		expires: Duration.default("2w"),
		burn: BooleanLike.default(true),
		showPassword: z.boolean().default(false),
	}).prefault({}),
	expires: z.union([
		Duration.array()
			.transform((keys) => keys.reduce((res, name) => ({ ...res, [name]: parseDuration(name) }), {})),
		z.record(
			z.string(),
			z.strictObject({
				count: z.number(),
				unit: z.enum(["Minute", "Hour", "Day", "Week", "Month", "Year"]),
				seconds: z.number(),
			}),
		),
	]).prefault(["5min", "1hr", "1d", "1w", "2w", "1m"]),
	logging: z.strictObject({
		level: z.enum(["debug", "info", "warning", "error", "fatal"]).default("info"),
		mode: z.enum(["text", "json"]).default("text"),
		logAccess: BooleanLike.default(false),
	}).prefault({}),
	policy: z.strictObject({
		requireBurn: BooleanLike.default(false),
		requirePassword: BooleanLike.default(false),
		denySlowBurn: BooleanLike.default(false),
		encryptionAlgorithm: z.enum(EncryptionAlgorithm).default(EncryptionAlgorithm.AES256GCM),
		recordEvents: BooleanLike.default(true),
	}).prefault({}),
	storage: z.strictObject({
		maxSize: Size.transform(sizeToBytes).default(sizeToBytes("10Mi")).or(z.coerce.number()),
		garbageCollection: z.strictObject({
			cron: z.string().default("* * * * *"),
		}).prefault({}),
		database: z.strictObject({
			host: z.string().default(""),
			port: z.coerce.number().default(5432),
			database: z.string().default(""),
			username: z.string().default(""),
			password: z.string().default(""),
			tls: z.enum(["require", "prefer", "off"]).default("off"),
		}).prefault({}),
	}).prefault({}),
}).prefault({})
