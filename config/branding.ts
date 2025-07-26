import { z, ZodType } from "@zod/zod"
import { TranslatedString } from "./string.ts"

/**
 * ToS Dialog show when the user first visits the app
 */
export interface Terms {
	/** Title */
	title: TranslatedString

	/** Text that may contain HTML */
	content: TranslatedString
}

export const Terms = z.strictObject({
	title: TranslatedString,
	content: TranslatedString,
})

/**
 * Custom link shown in the footer on the right
 */
export interface Link {
	/** Display text */
	name: TranslatedString

	/** Link URL */
	link: TranslatedString
}

export const Link: ZodType<Link> = z.strictObject({
	name: TranslatedString,
	link: TranslatedString,
})

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

export const Branding: ZodType<Branding> = z.object({
	appName: z.string().default("SecretBin"),
	footer: z.string().default("Nihility.io"),
	terms: Terms.optional(),
	links: Link.array().default([{ name: { en: "GitHub" }, link: { en: "https://github.com/Nihility-io/SecretBin" } }]),
	showLogo: z.boolean().default(true),
	invertLogo: z.boolean().default(false),
	showTerms: z.boolean().default(true),
})
