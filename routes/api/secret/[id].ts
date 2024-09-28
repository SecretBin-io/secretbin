import { responseFromResult } from "helpers"
import { Secrets } from "secret/server"
import { define } from "utils"

/**
 * Secret API: /secret/<some_id>
 */
export const handler = define.handlers({
	async GET({ params }) {
		return responseFromResult(await Secrets.shared.getSecretMetadata(params.id))
	},
	async POST({ params }) {
		return responseFromResult(await Secrets.shared.getSecret(params.id))
	},
	async DELETE({ params }) {
		return responseFromResult(await Secrets.shared.deleteSecret(params.id))
	},
})
