import { STATUS_CODE } from "@std/http/status"
import { encodeError, LocalizedError } from "utils/errors"

/**
 * Creates a success or error response depending on if the promise is fulfilled or rejected
 * @param p Promise
 * @returns Response
 */
export async function promiseResponse<T>(p: Promise<T>): Promise<Response> {
	try {
		const value = await p
		return Response.json(value, { status: STATUS_CODE.OK })
	} catch (err) {
		return Response.json(encodeError(err), {
			status: err instanceof LocalizedError ? err.status : STATUS_CODE.BadRequest,
		})
	}
}
