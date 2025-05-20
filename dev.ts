#!/usr/bin/env -S deno run -A --watch=static/,routes/
import { Builder } from "fresh/dev"
import { app } from "./main.ts"

const builder = new Builder({
	target: ["chrome127", "firefox128", "safari18"],
})

if (Deno.args.includes("build")) {
	await builder.build(app)
} else {
	await builder.listen(app)
}
