import tailwind from "$fresh/plugins/tailwind.ts"
import { defineConfig } from "$fresh/server.ts"
import { LangPlugin } from "@nihility-io/fresh-lang"
import { Secrets } from "secret/server"

// Trigger the garbage collector on startup
Secrets.shared.garbageCollection()

export default defineConfig({
	plugins: [
		tailwind(),
		LangPlugin(import.meta),
	],
})
