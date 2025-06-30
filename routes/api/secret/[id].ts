import { promiseResponse } from "helpers"
import { Secrets } from "secret/server"
import { define } from "utils"

/**
 * Secret API: /secret/<some_id>
 */
export const handler = define.handlers({
	GET({ params }): Promise<Response> {
		return promiseResponse(Secrets.shared.getSecretMetadata(params.id))
	},
	POST({ params }): Promise<Response> {
		return promiseResponse(Secrets.shared.getSecret(params.id))
	},
	DELETE({ params }): Promise<Response> {
		return promiseResponse(Secrets.shared.deleteSecret(params.id).then(() => ({ id: params.id })))
	},
})
