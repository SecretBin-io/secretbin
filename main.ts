import { App, staticFiles } from "fresh"
import { Secrets } from "server"
import { config } from "server/config"
import { loggingMiddleware, stateMiddleware } from "utils/middleware"
import { State } from "utils/state"

import "utils/errors/patch"

export const app = new App<State>()
app.use(staticFiles())
app.use(stateMiddleware)

// Use access logging if enabled
if (config.logging.logAccess) {
	app.use(loggingMiddleware)
}

const isBuildMode = Deno.args.includes("build") || Deno.args.includes("freshBuild")
if (!isBuildMode) {
	// Trigger the secret provider on startup but not when building
	if (!(await Secrets.shared.init())) {
		Deno.exit(-1)
	}
}

// Include file-system based routes here
app.fsRoutes()
