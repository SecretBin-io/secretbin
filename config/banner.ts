import z, { ZodType } from "zod"
import { TranslatedString } from "./string.ts"

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

export const Banner: ZodType<Banner> = z.strictInterface({
	enabled: z.boolean().default(false),
	type: z.enum(["info", "warning", "error"]).default("info"),
	text: TranslatedString.default({ en: "Hello World!" }),
})
