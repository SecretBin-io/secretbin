import { serveClientConfig } from "config"
import { HandlerByMethod } from "fresh"

export const handler: HandlerByMethod<unknown, unknown> = {
	GET: serveClientConfig,
}
