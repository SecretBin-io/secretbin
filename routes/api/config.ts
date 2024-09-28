import { serveClientConfig } from "config"
import { define } from "utils"

export const handler = define.handlers({
	GET: serveClientConfig,
})
