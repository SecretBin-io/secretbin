import * as CBOR from "cbor2"
import { Secrets } from "server"
import { parseSecretSubmission } from "server/models"
import { define } from "utils"
import { errorResponse, promiseResponse } from "utils/helpers"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	async POST({ req }): Promise<Response> {
		try {
			if (req.headers.get("Content-Type") !== "application/cbor") {
				return errorResponse(
					req,
					new Error("JSON secrets are no longer supported. Please use CBOR by updating your client."),
				)
			}
			const m = await parseSecretSubmission(await req.bytes().then(CBOR.decode))
			return promiseResponse(req, Secrets.shared.createSecret(m).then((id) => ({ id })))
		} catch (err) {
			return errorResponse(req, err)
		}
	},
})
