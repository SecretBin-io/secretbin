import z from "zod"
import { Config } from "./config.ts"
export type * from "./banner.ts"
export type * from "./branding.ts"
export type * from "./defaults.ts"
export type * from "./expires.ts"
export type * from "./logging.ts"
export type * from "./config.ts"
export type * from "./policy.ts"
export type * from "./storage.ts"
export type * from "./string.ts"

/**
 * Load the config.yaml file server side
 */
const serverCfg: Config = await (async () => {
	if (typeof document !== "undefined") {
		return undefined!
	}

	const YAML = await import("@std/yaml")
	const { deepMerge } = await import("@std/collections")

	const configs = await Promise.all(
		(await Array.fromAsync(Deno.readDir(".")))
			.filter((x) => /^config(?:\.[^\.]+)?\.ya?ml$/.test(x.name))
			.map((x) => Deno.readTextFile(x.name).then((x) => YAML.parse(x) as Record<string, unknown>)),
	)

	if (configs.length === 0) {
		return Config.parseAsync({})
	}

	try {
		return await Config.parseAsync(configs.reduce((p, c) => deepMerge(p, c), {}))
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
	const res = structuredClone(serverCfg)
	res.storage.database = undefined as never
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

let cachedClientConfig: Config | undefined = undefined

/**
 * Application configuration (config.yaml). This config is available to the server and client
 */
export const config: Config = await (async () => {
	if (typeof document === "undefined") {
		return serverCfg
	}

	if (!cachedClientConfig) {
		cachedClientConfig = await fetch("/api/config").then((x) => x.json())
	}

	return cachedClientConfig!
})()
