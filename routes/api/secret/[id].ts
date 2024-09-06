import { FreshContext, HandlerByMethod } from "fresh"
import { responseFromResult } from "helpers"
import { Secrets } from "secret/server"

/**
 * Secret API: /secret/<some_id>
 */
export const handler: HandlerByMethod<unknown, unknown> = {
	async GET(ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.getSecretMetadata(ctx.params.id))
	},
	async POST(ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.getSecret(ctx.params.id))
	},
	async DELETE(ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.deleteSecret(ctx.params.id))
	},
}
