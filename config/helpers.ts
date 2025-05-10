import { Expires } from "config"
import { match, P } from "ts-pattern"

/**
 * Parses a duration string
 * @param key Duration string e.g. 5d
 * @returns Expires object e.g. { count: 5, unit: "Days", seconds: 432000 }
 */
export const transformExpires = (key: string) =>
	match(/^(\d+)(min|hr|d|w|m|y)$/.exec(key))
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

/**
 * Parses a set of duration strings
 * @param key Set of duration string e.g. 5d
 * @returns Expires object e.g. { count: 5, unit: "Days", seconds: 432000 }
 */
export const parseExpires = (keys: string[]): Record<string, Expires> =>
	keys.reduce((res, name) => ({ ...res, [name]: transformExpires(name) }), {})

/**
 * Parses size string e.g. 10Mi into bytes
 * @param key Size string
 * @returns Size in Bytes
 */
export const transformSize = (key: string) =>
	match(/^(\d+)(Ki|Mi|Gi|K|M|G)?$/.exec(key))
		.with([P._, P.select()], (count) => +count)
		.with([P._, P.select(), "Ki"], (count) => +count * 1024)
		.with([P._, P.select(), "Mi"], (count) => +count * 1024 * 1024)
		.with([P._, P.select(), "Gi"], (count) => +count * 1024 * 1024 * 1024)
		.with([P._, P.select(), "K"], (count) => +count * 1000)
		.with([P._, P.select(), "M"], (count) => +count * 1000 * 1000)
		.with([P._, P.select(), "G"], (count) => +count * 1000 * 1000 * 1000)
		.otherwise(() => 0)
