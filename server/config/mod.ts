// deno-lint-ignore-file no-console
import * as YAML from "@std/yaml"
import { z } from "@zod/zod"
import { ConfigModel } from "./parser.ts"
import { Config } from "./types.ts"
export * from "./types.ts"

/**
 * Application configuration (config.yaml). This config is available to the server and client
 */
export const config = await (async function (): Promise<Config> {
	try {
		// Find either config.yaml or config.yml
		const configFile = (await Array.fromAsync(Deno.readDir(".")))
			.find((x) => /^config(?:\.[^\.]+)?\.ya?ml$/.test(x.name))

		const raw = (configFile ? await Deno.readTextFile(configFile.name).then((x) => YAML.parse(x)) : {}) as Config

		// Parse raw JSON so Zod hydrates missing default properties
		const config = await ConfigModel.parseAsync(raw) as unknown as Record<string, unknown>

		// Map env vars onto the hydrated object structure
		applyEnvOverrides(config)

		// Re-validate and apply coercion on string env values
		return await ConfigModel.parseAsync(config)
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

/**
 * Makes keys comparable by turning it lower case and
 * stripping all non-alphanumerical characters.
 * @param key Key to normalize
 * @returns Normalized key
 */
function normalizeKey(key: string): string {
	return key.toLowerCase().replace(/[^a-z0-9]/g, "")
}

/**
 * Traverses the config and applies matching environment variables using
 * case-insensitive key resolution.
 */
function applyEnvOverrides(target: Record<string, unknown>): void {
	// Prefix expected before environment variables
	const prefix = "SB_"

	const envVars = Deno.env.toObject()

	// Aliases used for backwards compatibility
	const envAliases = {
		SB_LOG_LEVEL: "SB_LOGGING_LEVEL",
		SB_LOG_MODE: "SB_LOGGING_MODE",
		SB_LOG_ACCESS: "SB_LOGGING_LOG_ACCESS",
		SB_DATABASE_HOST: "SB_STORAGE_DATABASE_HOST",
		SB_DATABASE_PORT: "SB_STORAGE_DATABASE_PORT",
		SB_DATABASE_DATABASE: "SB_STORAGE_DATABASE_DATABASE",
		SB_DATABASE_USERNAME: "SB_STORAGE_DATABASE_USERNAME",
		SB_DATABASE_PASSWORD: "SB_STORAGE_DATABASE_PASSWORD",
		SB_DATABASE_TLS: "SB_STORAGE_DATABASE_TLS",
	}

	// Rename aliases to their correct value
	for (const [k, v] of Object.entries(envAliases)) {
		if (k in envVars) {
			envVars[v] = envVars[k]
		}
	}

	for (const [rawEnvKey, envValue] of Object.entries(envVars)) {
		// Ignore env variable not meant for SecretBin
		if (!rawEnvKey.startsWith(prefix) || envValue === undefined) {
			continue
		}

		// Convert env name into upper case object path
		// Example:
		// SB_STORAGE_DATABASE_PASSWORD => ["STORAGE", "DATABASE", "PASSWORD"]
		const envSegments = rawEnvKey
			.slice(prefix.length)
			.split("_")
			.filter((s) => s.length > 0)

		let current: Record<string, unknown> | unknown[] = target

		for (let i = 0; i < envSegments.length; i++) {
			const segment = envSegments[i]
			const isLast = i === envSegments.length - 1

			if (Array.isArray(current)) {
				const index = Number(segment)
				if (isNaN(index)) { break }

				if (isLast) {
					current[index] = envValue
				} else {
					current = current[index] as Record<string, unknown> | unknown[]
				}
			} else if (typeof current === "object" && current !== null) {
				const normalizedSegment = normalizeKey(segment)

				const actualKey = Object.keys(current).find(
					(k) => normalizeKey(k) === normalizedSegment,
				)

				if (!actualKey) {
					break
				}

				if (isLast) {
					current[actualKey] = envValue
				} else {
					current = current[actualKey] as Record<string, unknown>
				}
			} else {
				break
			}
		}
	}
}
