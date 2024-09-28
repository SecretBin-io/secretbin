import { App, fsRoutes, staticFiles } from "fresh"
import { define, stateMiddleware } from "./utils.ts"
import { Secrets } from "secret/server"
import { type State } from "state"

export const app = new App<State>()
app.use(staticFiles())
app.use(stateMiddleware)

// this can also be defined via a file. feel free to delete this!
const exampleLoggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`)
  return ctx.next()
})
app.use(exampleLoggerMiddleware)

await fsRoutes(app, {
  dir: "./",
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
})

if (import.meta.main) {
  const isBuildMode = Deno.args.includes("build")
  if (!isBuildMode) {
    // Trigger the garbage collector on startup but not when building
    Secrets.shared.garbageCollection()
  }

  await app.listen()
}
