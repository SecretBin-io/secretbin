import { config } from "config"
import { App, fsRoutes, staticFiles } from "fresh"
import { logWeb } from "log"
import { Secrets } from "secret/server"
import { define, stateMiddleware } from "utils"
import { State } from "state"

export const app = new App<State>()
app.use(staticFiles())
app.use(stateMiddleware)

if (config.logging.level === "DEBUG") {
	// this can also be defined via a file. feel free to delete this!
	const loggerMiddleware = define.middleware(async (ctx) => {
		const res = await ctx.next()
		logWeb.debug(`${ctx.req.method} [${res.status}] ${ctx.req.url}`, {
			method: ctx.req.method,
			url: ctx.req.url,
			status: res.status,
		})
		return res
	})

	app.use(loggerMiddleware)
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
