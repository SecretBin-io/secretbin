import type { EncryptionAlgorithm } from "lib/crypto"

/**
 * Record where the keys are the languages codes and the value are the
 * string in that respective language
 */
export type TranslatedString = Record<string, string>

/**
 * Banner shown at the top of the app. You may use this option for e.g.
 * announcements.
 */
export interface Banner {
	/** Show the banner if true */
	enabled: boolean

	/** Banner type */
	type: "info" | "warning" | "error"

	/** Text shown in the banner */
	text: TranslatedString
}

/**
 * ToS Dialog show when the user first visits the app
 */
export interface Terms {
	/** Title */
	title: TranslatedString

	/** Text that may contain HTML */
	content: TranslatedString
}

/**
 * Custom link shown in the footer on the right
 */
export interface Link {
	/** Display text */
	name: TranslatedString

	/** Link URL */
	link: TranslatedString
}

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
}

/** Just customizable defaults */
export interface Defaults {
	/** Default expire time when creating a new secret */
	expires: string

	/** Default burn selection */
	burn: boolean

	/** Show password box by default */
	showPassword: boolean
}

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
 * Configs logging behavior
 */
export interface Logging {
	/** Logging level (default: info) */
	level: "debug" | "info" | "warning" | "error" | "fatal"

	/** Specifies if logs should be rendered as text or JSON (default: text) */
	mode: "text" | "json"

	/** Enable web access logging (default: false) */
	logAccess: boolean
}

/**
 * Set enforced usage policy for new secrets
 */
export interface Policy {
	/** Forces users to enable the burn option for new secrets */
	requireBurn: boolean

	/** Forces users to specify a password for new secrets */
	requirePassword: boolean

	/** Blocks users from enabling slow burn for new secrets */
	denySlowBurn: boolean

	/** Algorithm used for encrypting new secrets */
	encryptionAlgorithm: EncryptionAlgorithm

	/** Whether to record events such as reads, deletions, and expirations */
	recordEvents: boolean
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
	host: string
	port: number
	database: string
	username: string
	password: string
	tls: "require" | "prefer" | "off"
}

/**
 * Config the garbage collector which deletes expired secrets
 */
export interface GarbageCollection {
	/** Configure when the garbage collector should run */
	cron: string
}

/**
 * Configs regarding how secrets are stored
 */
export interface Storage {
	/** Max size a new secret is allowed to have (in bytes) */
	maxSize: number

	/** Config the garbage collector which deletes expired secrets */
	garbageCollection: GarbageCollection

	/** Configure the database where secrets are actually stored */
	database: DatabaseConfig
}

/** SecretBin config */
export interface Config {
	/**
	 * Banner shown at the top of the app. You may use this option for e.g.
	 * announcements.
	 */
	banner: Banner

	/**
	 * Branding allows you to brand SecretBin for service hoster.
	 * E.g. a company offering SecretBin may rename the service to anything
	 * they like.
	 */
	branding: Branding

	/** Just customizable defaults */
	defaults: Defaults

	/** Expire option for new secrets */
	expires: Record<string, Expires>

	/** Configs logging behavior */
	logging: Logging

	/** Set enforced usage policy for new secrets */
	policy: Policy

	/** Configs regarding how secrets are stored */
	storage: Storage
}
