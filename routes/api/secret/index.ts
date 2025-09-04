import { Secrets } from "server"
import { define } from "utils"
import { promiseResponse } from "utils/helpers"

/**
 * Secret API: /secret
 */
export const handler = define.handlers({
	POST(ctx): Promise<Response> {
		return promiseResponse(
			ctx.req.json()
				.then((x) => Secrets.shared.createSecret(x))
				.then((id) => ({ id })),
		)
	},
})
