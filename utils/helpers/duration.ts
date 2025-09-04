import { match, P } from "ts-pattern"

export interface Duration {
	/** Number of e.g. Minutes */
	count: number

	/** Support time units */
	unit: "Minute" | "Hour" | "Day" | "Week" | "Month" | "Year"

	/** Duration converted into seconds */
	seconds: number
}

/**
 * Parses a duration string
 * @param key Duration string e.g. 5d
 * @returns Expires object e.g. { count: 5, unit: "Days", seconds: 432000 }
 */
export function parseDuration(key: string): Duration {
	return match(/^(\d+)(min|hr|d|w|m|y)$/.exec(key))
		.with([P._, P.select(), "min"], (count): Duration => ({
			count: +count,
			unit: "Minute",
			seconds: +count * 60,
		})).with([P._, P.select(), "hr"], (count): Duration => ({
			count: +count,
			unit: "Hour",
			seconds: +count * 60 * 60,
		})).with([P._, P.select(), "d"], (count): Duration => ({
			count: +count,
			unit: "Day",
			seconds: +count * 60 * 60 * 24,
		})).with([P._, P.select(), "w"], (count): Duration => ({
			count: +count,
			unit: "Week",
			seconds: +count * 60 * 60 * 24 * 7,
		})).with([P._, P.select(), "m"], (count): Duration => ({
			count: +count,
			unit: "Month",
			seconds: +count * 60 * 60 * 24 * 30,
		})).with([P._, P.select(), "y"], (count): Duration => ({
			count: +count,
			unit: "Year",
			seconds: +count * 60 * 60 * 24 * 365,
		})).otherwise((): Duration => ({
			count: 0,
			unit: "Minute",
			seconds: 0,
		}))
}
