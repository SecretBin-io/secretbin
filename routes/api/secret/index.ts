import { FreshContext, Handlers } from "$fresh/server.ts"
import Result from "@nihility-io/result"
import { responseFromResult } from "helpers"
import { NewSecret } from "secret/models"
import { Secrets } from "secret/server"

/**
 * Secret API: /secret
 */
export const handler: Handlers = {
	async POST(req: Request, _ctx: FreshContext) {
		try {
			// Note: data is validated inside createSecret
			const m: NewSecret = await req.json()
			return responseFromResult(await Secrets.shared.createSecret(m))
		} catch (e) {
			return responseFromResult(Result.failure<string>(e))
		}
	},
}
