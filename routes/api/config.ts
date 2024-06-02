import { Handlers } from "$fresh/server.ts"
import { serveClientConfig } from "config"

export const handler: Handlers = {
	GET: serveClientConfig,
}
