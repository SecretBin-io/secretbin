import { SecretRequest } from "models"
import { Secrets } from "server"
import { define } from "utils"
import { decodeBody, errorResponse, promiseResponse } from "utils/helpers"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	async POST({ req }): Promise<Response> {
		// Note: data is validated inside createSecret
		try {
			const m = await decodeBody<SecretRequest>(req)
			return promiseResponse(req, Secrets.shared.createSecret(m).then((id) => ({ id })))
		} catch (err) {
			return errorResponse(req, err)
		}
	},
})
