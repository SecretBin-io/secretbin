import { define } from "utils"
import { successResponse } from "utils/helpers"
import denoJson from "../../deno.json" with { type: "json" }

export const handler = define.handlers({
	GET({ req }): Response {
		return successResponse(req, { version: denoJson.version })
	},
})
