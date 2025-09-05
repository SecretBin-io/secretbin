import { define } from "utils"
import { successResponse } from "utils/helpers"

export const handler = define.handlers({
	GET({ req, state: { config } }): Response {
		return successResponse(req, config)
	},
})
