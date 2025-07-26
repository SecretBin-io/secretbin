import z from "@zod/zod"
import { match, P } from "ts-pattern"

/**
 * Parses a duration string
 * @param key Duration string e.g. 5d
 * @returns Expires object e.g. { count: 5, unit: "Days", seconds: 432000 }
 */
function transformExpires(key: string): Expires {
	return match(/^(\d+)(min|hr|d|w|m|y)$/.exec(key))
		.with(
			[P._, P.select(), "min"],
			(count) => ({ count: +count, unit: "Minute", seconds: +count * 60 } as Expires),
		)
		.with(
			[P._, P.select(), "hr"],
			(count) => ({ count: +count, unit: "Hour", seconds: +count * 60 * 60 } as Expires),
		)
		.with(
			[P._, P.select(), "d"],
			(count) => ({ count: +count, unit: "Day", seconds: +count * 60 * 60 * 24 } as Expires),
		)
		.with(
			[P._, P.select(), "w"],
			(count) => ({ count: +count, unit: "Week", seconds: +count * 60 * 60 * 24 * 7 } as Expires),
		)
		.with(
			[P._, P.select(), "m"],
			(count) => ({ count: +count, unit: "Month", seconds: +count * 60 * 60 * 24 * 30 } as Expires),
		)
		.with(
			[P._, P.select(), "y"],
			(count) => ({ count: +count, unit: "Year", seconds: +count * 60 * 60 * 24 * 365 } as Expires),
		)
		.otherwise(() => ({ count: 0, unit: "Minute", seconds: 0 } as Expires))
}

/**
 * Parses a set of duration strings
 * @param key Set of duration string e.g. 5d
 * @returns Expires object e.g. { count: 5, unit: "Days", seconds: 432000 }
 */
function parseExpires(keys: string[]): Record<string, Expires> {
	return keys.reduce((res, name) => ({ ...res, [name]: transformExpires(name) }), {})
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

export const Expires = z.string()
	.regex(/^(\d+)(min|hr|d|w|m|y)$/, { error: "Invalid expires format. Expected: <num>(min|hr|d|w|m|y) e.g 5min" })
	.array().transform(parseExpires)
	.default(parseExpires(["5min", "1hr", "1d", "1w", "2w", "1m"]))
