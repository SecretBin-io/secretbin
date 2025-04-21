import { responseFromResult } from "helpers"
import { Secrets } from "secret/server"
import { define } from "utils"

/**
 * Secret API: /secret/<some_id>
 */
export const handler = define.handlers({
	GET: ({ params }) => Secrets.shared.getSecretMetadata(params.id).then(responseFromResult),
	POST: ({ params }) => Secrets.shared.getSecret(params.id).then(responseFromResult),
	DELETE: ({ params }) => Secrets.shared.deleteSecret(params.id).then(responseFromResult),
})
