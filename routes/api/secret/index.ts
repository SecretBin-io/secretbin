import Result from "@nihility-io/result"
import { responseFromResult } from "helpers"
import { NewSecret } from "secret/models"
import { Secrets } from "secret/server"
import { define } from "utils"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	async POST(ctx) {
		try {
			// Note: data is validated inside createSecret
			const m: NewSecret = await ctx.req.json()
			return responseFromResult(await Secrets.shared.createSecret(m))
		} catch (e) {
			return responseFromResult(Result.failure<string>(e))
		}
	},
})
