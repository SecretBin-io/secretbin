import { STATUS_CODE } from "@std/http/status"
import { LocalizedError } from "lang"
import { encodeError } from "./error.ts"

/**
 * Creates a success or error response depending on if the promise is fulfilled or rejected
 * @param p Promise
 * @returns Response
 */
export async function promiseResponse<T>(p: Promise<T>): Promise<Response> {
	try {
		const value = await p
		return successResponse(value)
	} catch (err) {
		return errorResponse(err)
	}
}

/**
 * Creates a success response
 * @param err Error
 * @returns Response
 */
export function successResponse<T>(value: T): Response {
	return Response.json(value, { status: STATUS_CODE.OK })
}

/**
 * Creates a error response
 * @param err Error
 * @returns Response
 */
export function errorResponse(err: Error | unknown): Response {
	const status = err instanceof LocalizedError ? err.status : STATUS_CODE.BadRequest
	const res = err instanceof Error ? err : new Error(`${err}`)
	return Response.json(encodeError(res), { status })
}
