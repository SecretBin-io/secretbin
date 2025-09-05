import { STATUS_CODE } from "@std/http/status"
import * as MsgPack from "@std/msgpack"
import { encodeError, LocalizedError } from "utils/errors"

/**
 * Creates a success or error response depending on if the promise is fulfilled or rejected
 * @param p Promise
 * @returns Response
 */
export async function promiseResponse<T>(req: Request, p: Promise<T>): Promise<Response> {
	try {
		const value = await p
		return successResponse(req, value)
	} catch (err) {
		return errorResponse(req, err)
	}
}

/**
 * Creates a success response
 * @param err Error
 * @returns Response
 */
export function successResponse<T>(req: Request, value: T): Response {
	return encodeResponse(req, value, { status: STATUS_CODE.OK })
}

/**
 * Creates a error response
 * @param err Error
 * @returns Response
 */
export function errorResponse(req: Request, err: Error | unknown): Response {
	return encodeResponse(req, encodeError(err), {
		status: err instanceof LocalizedError ? err.status : STATUS_CODE.BadRequest,
	})
}

/**
 * Creates a response in either MsgPack or JSON depending on the request's accept header
 * @param req Request which is used to determine if MsgPack or JSON is send
 * @param res Response to encode
 * @param options Specify response headers and status code
 * @returns Response
 */
function encodeResponse<T>(req: Request, res: T, options?: ResponseInit): Response {
	const useMsgPack = req.headers.get("Accept")?.includes("application/vnd.msgpack") ?? false

	if (!useMsgPack) {
		return Response.json(res, options)
	}

	return new Response(MsgPack.encode(res as MsgPack.ValueType), {
		...options,
		headers: { ...(options?.headers ?? {}), "Content-Type": "application/vnd.msgpack" },
	})
}

/**
 * Decode the request or responses's body content using either MsgPack or JSON
 * depending on the content type.
 * @param r Request or response
 * @returns Body content
 */
export function decodeBody<T>(r: Request | Response): Promise<T> {
	return r.headers.get("Content-Type") === "application/vnd.msgpack"
		? r.bytes().then(MsgPack.decode) as Promise<T>
		: r.json() as Promise<T>
}
