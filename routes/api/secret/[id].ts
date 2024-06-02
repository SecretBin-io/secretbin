import { FreshContext, Handlers } from "$fresh/server.ts"
import { responseFromResult } from "helpers"
import { Secrets } from "secret/server"

/**
 * Secret API: /secret/<some_id>
 */
export const handler: Handlers = {
	async OPTIONS(_req: Request, ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.getSecretMetadata(ctx.params.id))
	},
	async GET(_req: Request, ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.getSecretMetadata(ctx.params.id))
	},
	async POST(_req: Request, ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.getSecret(ctx.params.id))
	},
	async DELETE(_req: Request, ctx: FreshContext) {
		return responseFromResult(await Secrets.shared.deleteSecret(ctx.params.id))
	},
}
