import z from "zod"
import { Config } from "./model.ts"
export type * from "./model.ts"
export type * from "./storage.ts"

/**
 * Load the config.yaml file server side
 */
const serverCfg: Config = await (async () => {
	if (typeof document !== "undefined") {
		return undefined!
	}

	const { exists } = await import("@std/fs")
	const YAML = await import("@std/yaml")

	if (!(await exists("config.yaml"))) {
		return Config.parseAsync({})
	}

	try {
		return await Deno.readTextFile("config.yaml")
			.then((x) => YAML.parse(x))
			.catch(() => ({}))
			.then(Config.parseAsync)
	} catch (e) {
		console.error("Failed to parse config file. Reason: ")
		if (!(e instanceof z.ZodError)) {
			console.error(e)
		} else {
			for (const issue of e.issues) {
				console.error(`  Path: /${issue.path.join("/")}\n    Error: ${issue.message}`)
			}
		}
		console.error("Exiting...")
		Deno.exit(-1)
	}
})()

/**
 * Censor the config by removing data which should not be exposed to the client
 */
export const clientCfg: Config = (() => {
	if (typeof document !== "undefined") {
		return undefined!
	}
	// deno-lint-ignore no-undef
	const res = structuredClone(serverCfg)
	res.storage.backend = undefined as never
	return res
})()

/**
 * Serves the client configuration via HTTP in the backend. See [/routes/api/config.ts]
 */
export const serveClientConfig = () =>
	new Response(JSON.stringify(clientCfg), {
		headers: {
			"Content-Type": "application/json",
		},
	})

/**
 * Application configuration (config.yaml). This config is available to the server and client
 */
export const config: Config = await (async () => {
	if (typeof document === "undefined") {
		return serverCfg
	}

	return await fetch("/api/config").then((x) => x.json())
})()
