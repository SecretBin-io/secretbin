import { FreshContext, HandlerByMethod } from "fresh"
import Result from "@nihility-io/result"
import { responseFromResult } from "helpers"
import { NewSecret } from "secret/models"
import { Secrets } from "secret/server"

/**
 * Secret API: /secret
 */
export const handler: HandlerByMethod<unknown, unknown> = {
	async POST(ctx: FreshContext) {
		try {
			// Note: data is validated inside createSecret
			const m: NewSecret = await ctx.req.json()
			return responseFromResult(await Secrets.shared.createSecret(m))
		} catch (e) {
			return responseFromResult(Result.failure<string>(e))
		}
	},
}
