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
			Secrets.shared.getSecretMetadata(params.id),
		)
	},
	async POST({ req, params }): Promise<Response> {
		try {
			const res = await Secrets.shared.getSecret(params.id)
			// If secret contains raw bytes, force using CBOR
			const forceCBOR = res.dataBytes !== undefined
			return successResponse(req, res, forceCBOR)
		} catch (err) {
			return errorResponse(req, err)
		}
	},
	DELETE({ req, params }): Promise<Response> {
		return promiseResponse(req, Secrets.shared.deleteSecret(params.id).then(() => ({ id: params.id })))
	},
})
