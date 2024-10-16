import Result from "@nihility-io/result"

/**
 * Converts a result into a HTTP response
 * @param r Result
 * @returns Response
 */
export const responseFromResult = <T>(r: Result<T>) =>
	new Response(JSON.stringify(r), {
		headers: {
			"Content-Type": "application/json",
		},
	})

/**
 * Converts number of bytes into human readable size
 * @param bytes Number of bytes
 * @param si True uses KB, MB, etc; false uses KiB, MiB, etc
 * @param dp Decimal points
 * @returns String containing human readable size with unit
 */
export const humanReadableSize = (bytes: number, si = true, dp = 1) => {
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
