#!/usr/bin/env -S deno run -A --watch=static/,routes/
import { Builder } from "fresh/dev"
import { app } from "./main.ts"
import type { App } from "fresh"
import tailwindCss from "@tailwindcss/postcss"
import postcss from "postcss"

const tailwind = <T>(builder: Builder, app: App<T>): void => {
	let processor: postcss.Processor | null

	builder.onTransformStaticFile(
		{ pluginName: "tailwind", filter: /\.css$/ },
		async (args) => {
			if (!processor) {
				processor = postcss([
					tailwindCss({ optimize: app.config.mode === "production" }),
				])
			}
			const res = await processor.process(args.text, { from: args.path })
			return {
				content: res.content,
				map: res.map?.toString(),
			}
		},
	)
}

const builder = new Builder()
tailwind(builder, app)

if (Deno.args.includes("build")) {
	await builder.build(app)
} else {
	await builder.listen(app)
}
