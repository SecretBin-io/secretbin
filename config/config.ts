import z, { ZodType } from "zod"
import { Banner } from "./banner.ts"
import { Branding } from "./branding.ts"
import { Defaults } from "./defaults.ts"
import { Expires } from "./expires.ts"
import { Logging } from "./logging.ts"
import { Policy } from "./policy.ts"
import { Storage } from "./storage.ts"

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

export const Config: ZodType<Config> = z.strictInterface({
	banner: Banner.default(Banner.parse({})),
	branding: Branding.default(Branding.parse({})),
	defaults: Defaults.default(Defaults.parse({})),
	expires: Expires.default(Expires.parse([])),
	logging: Logging.default(Logging.parse({})),
	policy: Policy.default(Policy.parse({})),
	storage: Storage.default(Storage.parse({})),
})
