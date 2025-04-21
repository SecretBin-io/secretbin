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
		// Note: data is validated inside createSecret
		const m = await Result.fromPromise<NewSecret>(ctx.req.json())
		return m.mapAsync((x) => Secrets.shared.createSecret(x)).then(responseFromResult)
	},
})
