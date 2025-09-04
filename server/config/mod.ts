// deno-lint-ignore-file no-console
import { deepMerge } from "@std/collections"
import * as YAML from "@std/yaml"
import { z } from "@zod/zod"
import { ConfigModel } from "./parser.ts"
import { Config } from "./types.ts"

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
		return await ConfigModel.parseAsync(configs.reduce((p, c) => deepMerge(p, c), {}))
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
