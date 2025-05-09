import { errorResponse, promiseResponse } from "helpers"
import { NewSecret } from "secret/models"
import { Secrets } from "secret/server"
import { define } from "utils"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	async POST(ctx) {
		// Note: data is validated inside createSecret
		try {
			const m = await ctx.req.json() as NewSecret
			return promiseResponse(Secrets.shared.createSecret(m))
		} catch (e) {
			return errorResponse(e as Error)
		}
	},
})
