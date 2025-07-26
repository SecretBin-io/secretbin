import { config } from "config"
import { App, HttpError, staticFiles } from "fresh"
import { LocalizedError } from "lang"
import { Secrets } from "secret/server"
import { State } from "state"
import { loggingMiddleware, stateMiddleware } from "utils"

// TODO: Remove when or if https://github.com/denoland/fresh/issues/2995 is implemented
// This is a workaround which allows LocalizedError to be recognized as an instance of
// HttpError, which is needed for Fresh to set the correct status code.
const orig = HttpError[Symbol.hasInstance]
Object.defineProperty(HttpError, Symbol.hasInstance, {
	get(): (this: HttpError, obj: unknown) => boolean {
		return function (this: HttpError, obj: unknown): boolean {
			// instanceof returns true for HttpError and LocalizedError
			return orig.call(this, obj) || obj instanceof LocalizedError
		}
	},
})

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
