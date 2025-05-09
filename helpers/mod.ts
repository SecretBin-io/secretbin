import Result from "@nihility-io/result"
import { STATUS_CODE } from "@std/http/status"
import { LocalizedError } from "lang"
export * from "./useSetting.ts"

/**
 * Creates a success or error response depending on if the promise is fulfilled or rejected
 * @param p Promise
 * @returns Response
 */
export const promiseResponse = <T>(p: Promise<T>) => p.then(successResponse).catch(errorResponse)

/**
 * Creates a response from a result type
 * @param r Result
 * @returns Response
 */
export const resultResponse = <T>(r: Result<T>) =>
	r.match({
		success: successResponse,
		failure: errorResponse,
	})

/**
 * Creates a success response
 * @param err Error
 * @returns Response
 */
export const successResponse = <T>(value: T) =>
	Response.json(Result.success(value), {
		status: STATUS_CODE.OK,
	})

/**
 * Creates a error response
 * @param err Error
 * @returns Response
 */
export const errorResponse = (err: Error | unknown) => {
	const status = err instanceof LocalizedError ? err.code : STATUS_CODE.BadRequest
	const res = err instanceof Error ? err : `${err}`
	return Response.json(Result.failure(res), { status })
}

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
