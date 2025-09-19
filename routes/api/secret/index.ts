import * as CBOR from "cbor2"
import { SecretSubmission } from "models"
import { Secrets } from "server"
import { define } from "utils"
import { errorResponse, promiseResponse } from "utils/helpers"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	async POST({ req }): Promise<Response> {
		// Note: data is validated inside createSecret
		try {
			if (req.headers.get("Content-Type") !== "application/cbor") {
				return errorResponse(
					req,
					new Error("JSON secrets are no longer supported. Please use CBOR by updating your client."),
				)
			}
			const m = await req.bytes().then(CBOR.decode) as SecretSubmission
			return promiseResponse(req, Secrets.shared.createSecret(m).then((id) => ({ id })))
		} catch (err) {
			return errorResponse(req, err)
		}
	},
})
