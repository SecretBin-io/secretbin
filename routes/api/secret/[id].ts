import { Secrets } from "server"
import { define } from "utils"
import { errorResponse, promiseResponse, successResponse } from "utils/helpers"

/**
 * Secret API: /secret/<some_id>
 */
export const handler = define.handlers({
	GET({ req, params }): Promise<Response> {
		return promiseResponse(
			req,
			Secrets.shared.getSecretMetadata(params.id).then(expiresToString),
		)
	},
	async POST({ req, params }): Promise<Response> {
		try {
			const res = await Secrets.shared.getSecret(params.id).then(expiresToString)
			// If secret contains raw bytes, force using MsgPack
			if (res.dataBytes !== undefined) {
				req.headers.set("Accept", "application/vnd.msgpack")
			}
			return successResponse(req, res)
		} catch (err) {
			return errorResponse(req, err)
		}
	},
	DELETE({ req, params }): Promise<Response> {
		return promiseResponse(req, Secrets.shared.deleteSecret(params.id).then(() => ({ id: params.id })))
	},
})

/**
 * Turns the expires field of the object into a string in order to make it compatible with MsgPack
 * @param obj Source object
 * @returns Object with expired turned into a string
 */
function expiresToString<T extends { expires: Date }>(obj: T): Omit<T, "expires"> & { expires: string } {
	return { ...obj, expires: obj.expires.toISOString() }
}
