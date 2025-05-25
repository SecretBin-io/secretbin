import { match, P } from "ts-pattern"

/**
 * Parses size string e.g. 10Mi into bytes
 * @param key Size string
 * @returns Size in Bytes
 */
export function sizeToBytes(key: string): number {
	return match(/^(\d+)(Ki|Mi|Gi|K|M|G)?$/.exec(key))
		.with([P._, P.select()], (count) => +count)
		.with([P._, P.select(), "Ki"], (count) => +count * 1024)
		.with([P._, P.select(), "Mi"], (count) => +count * 1024 * 1024)
		.with([P._, P.select(), "Gi"], (count) => +count * 1024 * 1024 * 1024)
		.with([P._, P.select(), "K"], (count) => +count * 1000)
		.with([P._, P.select(), "M"], (count) => +count * 1000 * 1000)
		.with([P._, P.select(), "G"], (count) => +count * 1000 * 1000 * 1000)
		.otherwise(() => 0)
}

/**
 * Converts number of bytes into human readable size
 * @param bytes Number of bytes
 * @param si True uses KB, MB, etc; false uses KiB, MiB, etc
 * @param dp Decimal points
 * @returns String containing human readable size with unit
 */
export function humanReadableSize(bytes: number, si = true, dp = 1): string {
	const thresh = si ? 1000 : 1024

	if (Math.abs(bytes) < thresh) {
		return bytes + " B"
	}

	const units = si
		? ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
	let u = -1
	const r = 10 ** dp

	do {
		bytes /= thresh
		++u
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

	return bytes.toFixed(dp) + " " + units[u]
}
