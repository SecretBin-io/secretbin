import { STATUS_CODE } from "@std/http/status"
import { define } from "utils"

export const handler = define.handlers({
	GET({ state: { config } }): Response {
		return Response.json(config, { status: STATUS_CODE.OK })
	},
})
