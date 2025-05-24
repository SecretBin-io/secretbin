import z, { ZodType } from "zod"

/** Just customizable defaults */
export interface Defaults {
	/** Default expire time when creating a new secret */
	expires: string

	/** Default burn selection */
	burn: boolean

	/** Show password box by default */
	showPassword: boolean
}

export const Defaults: ZodType<Defaults> = z.strictInterface({
	expires: z.string().regex(/^(\d+)(min|hr|d|w|m|y)$/, {
		error: "Invalid expires format. Expected: <num>(min|hr|d|w|m|y) e.g 5min",
	}).default("2w"),
	burn: z.boolean().default(true),
	showPassword: z.boolean().default(false),
})
