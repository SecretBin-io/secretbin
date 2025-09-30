import * as fs from "@std/fs"
import { App, staticFiles } from "fresh"
import { Secrets } from "server"
import { config } from "server/config"
import { loggingMiddleware, publicFiles, stateMiddleware } from "utils/middleware"
import { State } from "utils/state"

import "utils/errors/patch"

export const app = new App<State>()
if (await fs.exists("./public")) {
	app.use(publicFiles())
}
app.use(staticFiles())
app.use(stateMiddleware)

// Use access logging if enabled
if (config.logging.logAccess) {
	app.use(loggingMiddleware)
}

if (!Deno.args.includes("build")) {
	// Trigger the secret provider on startup but not when building
	if (!(await Secrets.shared.init())) {
		Deno.exit(-1)
	}
}

// Include file-system based routes here
app.fsRoutes()
