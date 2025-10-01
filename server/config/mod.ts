// deno-lint-ignore-file no-console
import { deepMerge } from "@std/collections"
import * as YAML from "@std/yaml"
import { z } from "@zod/zod"
import { ConfigModel } from "./parser.ts"
import { Config, DatabaseConfig, Logging, Storage } from "./types.ts"

export * from "./types.ts"

/*
/**
 * Application configuration (config.yaml). This config is available to the server and client
 */
export const config = await (async function (): Promise<Config> {
	const configs = await Promise.all(
		(await Array.fromAsync(Deno.readDir(".")))
			.filter((x) => /^config(?:\.[^\.]+)?\.ya?ml$/.test(x.name))
			.toSorted((a, b) => /^config\.ya?ml$/.test(a.name) ? -1 : a.name.localeCompare(b.name)) // Order configs by name but always evaluate config.yaml first
			.map((x) => Deno.readTextFile(x.name).then((x) => YAML.parse(x) as Record<string, unknown>)),
	)

	if (configs.length === 0) {
		return ConfigModel.parseAsync({})
	}

	try {
		const raw = configs.reduce((p, c) => deepMerge(p, c), {}) as unknown as Config

		// Override config using environment variables
		raw.logging ??= {} as Logging
		raw.storage ??= {} as Storage
		raw.storage.database ??= {} as DatabaseConfig

		if (Deno.env.get("SB_LOG_LEVEL")) {
			raw.logging.level = Deno.env.get("SB_LOG_LEVEL") as "debug" | "info" | "warning" | "error" | "fatal" ?? raw.logging.level
		}
		if (Deno.env.get("SB_LOG_MODE")) {
			raw.logging.mode = Deno.env.get("SB_LOG_MODE") as "text" | "json"
		}
		if (Deno.env.get("SB_LOG_ACCESS")) {
			raw.logging.logAccess = ["1", "true", "yes"].includes(Deno.env.get("SB_LOG_ACCESS")!.toLowerCase())
		}

		if (Deno.env.get("SB_DATABASE_HOST")) {
			raw.storage.database.host = Deno.env.get("SB_DATABASE_HOST")!
		}
		if (Deno.env.get("SB_DATABASE_PORT")) {
			raw.storage.database.port = +Deno.env.get("SB_DATABASE_PORT")!
		}
		if (Deno.env.get("SB_DATABASE_DATABASE")) {
			raw.storage.database.database = Deno.env.get("SB_DATABASE_DATABASE")!
		}
		if (Deno.env.get("SB_DATABASE_USERNAME")) {
			raw.storage.database.username = Deno.env.get("SB_DATABASE_USERNAME")!
		}
		if (Deno.env.get("SB_DATABASE_PASSWORD")) {
			raw.storage.database.password = Deno.env.get("SB_DATABASE_PASSWORD")!
		}
		if (Deno.env.get("SB_DATABASE_TLS")) {
			raw.storage.database.tls = Deno.env.get("SB_DATABASE_TLS")! as "require" | "prefer" | "off"
		}

		return await ConfigModel.parseAsync(raw)
	} catch (err) {
		console.error("Failed to parse config file. Reason: ")
		if (!(err instanceof z.ZodError)) {
			console.error(err)
		} else {
			for (const issue of err.issues) {
				console.error(`  Path: /${issue.path.join("/")}\n    Error: ${issue.message}`)
			}
		}
		console.error("Exiting...")
		Deno.exit(-1)
	}
})()
