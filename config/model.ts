import { z } from "zod"
import { transformExpires, transformSize } from "./helpers.ts"
import { BackendConfig } from "./storage.ts"

/**
 * Record where the keys are the languages codes and the value are the
 * string in that respective language
 */
export type TranslatedString = Record<string, string>
export const TranslatedString = z.record(z.string(), z.string())

/**
 * ToS Dialog show when the user first visits the app
 */
export interface Terms {
	/** Title */
	title: TranslatedString

	/** Text that may contain HTML */
	content: TranslatedString
}

export const Terms = z.object({
	title: TranslatedString,
	content: TranslatedString,
}).strict()

/**
 * Custom link shown in the footer on the right
 */
export interface Link {
	/** Display text */
	name: TranslatedString

	/** Link URL */
	link: TranslatedString
}

export const Link = z.object({
	name: TranslatedString,
	link: TranslatedString,
}).strict()

/**
 * Branding allows you to brand SecretBin for service hoster.
 * E.g. a company offering SecretBin may rename the service to anything
 * they like.
 */
export interface Branding {
	/** Changes the app in all places including but not limited to the title bar */
	appName: string

	/** Text shown in the footer on the left side e.g. the name of the service hoster */
	footer: string

	/** ToS Dialog show when the user first visits the app */
	terms?: Terms

	/** Custom link shown in the footer on the right */
	links: Link[]

	/** If set the true, the app logo is shown before the app name in the navigation bar */
	showLogo: boolean

	/** Invert the colors of the app logo in dark mode */
	invertLogo: boolean

	/** Sets if the ToS window should be shown when a user fist visits the app */
	showTerms: boolean
}

export const Branding = z.object({
	appName: z.string().default("SecretBin"),
	footer: z.string().default("Nihility.io"),
	terms: Terms.optional(),
	links: Link.array().default([{ name: { en: "GitHub" }, link: { en: "https://github.com/Nihility-io/SecretBin" } }]),
	showLogo: z.boolean().default(true),
	invertLogo: z.boolean().default(false),
	showTerms: z.boolean().default(true),
}).strict()

/** Just customizable defaults */
export interface Defaults {
	/** Default expire time when creating a new secret */
	expires: string

	/** Default burn selection */
	burn: boolean

	/** Show password box by default */
	showPassword: boolean
}

export const Defaults = z.object({
	expires: z.string().regex(
		/^(\d+)(min|hr|d|w|m|y)$/,
		"Invalid expires format. Expected: <num>(min|hr|d|w|m|y) e.g 5min",
	).default("2w"),
	burn: z.boolean().default(true),
	showPassword: z.boolean().default(false),
}).strict()

/**
 * Set enforced usage policy for new secrets
 */
export interface Policy {
	/** Pre-selects the link in the share view */
	sharePreselect: boolean

	/** Forces users to enable the burn option for new secrets */
	requireBurn: boolean

	/** Forces users to specify a password for new secrets */
	requirePassword: boolean

	/** Blocks users from enabling slow burn for new secrets */
	denySlowBurn: boolean
}

export const Policy = z.object({
	sharePreselect: z.boolean().default(false),
	requireBurn: z.boolean().default(false),
	requirePassword: z.boolean().default(false),
	denySlowBurn: z.boolean().default(false),
}).strict()

/**
 * Expire option for new secrets
 */
export interface Expires {
	/** Number of e.g. Minutes */
	count: number

	/** Support time units */
	unit: "Minute" | "Hour" | "Day" | "Week" | "Month" | "Year"

	/** Duration converted into seconds */
	seconds: number
}

/**
 * Configs regarding how secrets are stored
 */
export interface Storage {
	/** Max size a new secret is allowed to have (in bytes) */
	maxSize: number

	/** Interval in seconds in which the garbage collector should run */
	gcInterval: number

	/** Configure the backend where secrets are actually stored */
	backend: BackendConfig
}

export const Storage = z.object({
	maxSize: z.string().regex(
		/^(\d+)(Ki|Mi|Gi|K|M|G)$/,
		"Invalid size. Expected: positive integer or string with format <num>(Ki|Mi|Gi|K|M|G) e.g 10Gi",
	).transform(transformSize).or(z.number().int().positive()).default("10Mi"),
	gcInterval: z.number().int().default(60 * 60),
	backend: BackendConfig.default({ type: "kv" }),
}).strict()

/**
 * Configs logging behavior
 */
export interface Logging {
	/** Log log (default: info) */
	level: "NOTSET" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"
}

export const Logging = z.object({
	level: z.enum(["NOTSET", "DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]).default("INFO"),
}).strict()

/** SecretBin config */
export interface Config {
	/**
	 * Branding allows you to brand SecretBin for service hoster.
	 * E.g. a company offering SecretBin may rename the service to anything
	 * they like.
	 */
	branding: Branding

	/**
	 * Banner shown at the top of the app. You may use this option for e.g.
	 * announcements. */
	banner: TranslatedString

	/** Just customizable defaults */
	defaults: Defaults

	/** Set enforced usage policy for new secrets */
	policy: Policy

	/** Configs logging behavior */
	logging: Logging

	/** Expire option for new secrets */
	expires: Record<string, Expires>

	/** Configs regarding how secrets are stored */
	storage: Storage
}

export const Config = z.object({
	branding: Branding.default({}),
	banner: TranslatedString.default({}),
	defaults: Defaults.default({}),
	policy: Policy.default({}),
	logging: Logging.default({}),
	expires: z.string().regex(
		/^(\d+)(min|hr|d|w|m|y)$/,
		"Invalid expires format. Expected: <num>(min|hr|d|w|m|y) e.g 5min",
	).array().default(["5min", "1hr", "1d", "1w", "2w", "1m"])
		.transform((x) =>
			x.reduce((res, name) => ({ ...res, [name]: transformExpires(name) }), {} as Record<string, Expires>)
		),
	storage: Storage.default({}),
}).strict()
