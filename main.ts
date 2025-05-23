import { config } from "config"
import { App, fsRoutes, staticFiles } from "fresh"
import { Secrets } from "secret/server"
import { State } from "state"
import { loggingMiddleware, stateMiddleware } from "utils"

export const app = new App<State>()
app.use(staticFiles())
app.use(stateMiddleware)

// Use access logging if enabled
if (config.logging.logAccess) {
	app.use(loggingMiddleware)
}

await fsRoutes(app, {
	dir: "./",
	loadIsland: (path) => import(`./islands/${path}`),
	loadRoute: (path) => import(`./routes/${path}`),
})

const isBuildMode = Deno.args.includes("build") || Deno.args.includes("freshBuild")
if (!isBuildMode) {
	// Trigger the secret provider on startup but not when building
	if (!(await Secrets.shared.init())) {
		Deno.exit(-1)
	}
}

if (import.meta.main) {
	await app.listen()
}
