import { STATUS_CODE } from "@std/http/status"
import { define } from "utils"
import denoJson from "../../deno.json" with { type: "json" }

export const handler = define.handlers({
	GET(): Response {
		return Response.json({ version: denoJson.version }, { status: STATUS_CODE.OK })
	},
})
