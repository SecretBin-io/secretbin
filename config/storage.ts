import { match, P } from "ts-pattern"
import z, { ZodType } from "zod"

/**
 * Parses size string e.g. 10Mi into bytes
 * @param key Size string
 * @returns Size in Bytes
 */
export const transformSize = (key: string) =>
	match(/^(\d+)(Ki|Mi|Gi|K|M|G)?$/.exec(key))
		.with([P._, P.select()], (count) => +count)
		.with([P._, P.select(), "Ki"], (count) => +count * 1024)
		.with([P._, P.select(), "Mi"], (count) => +count * 1024 * 1024)
		.with([P._, P.select(), "Gi"], (count) => +count * 1024 * 1024 * 1024)
		.with([P._, P.select(), "K"], (count) => +count * 1000)
		.with([P._, P.select(), "M"], (count) => +count * 1000 * 1000)
		.with([P._, P.select(), "G"], (count) => +count * 1000 * 1000 * 1000)
		.otherwise(() => 0)

export interface PostgresDatabaseConfig {
	type: "postgres"
	host: string
	port: number
	database: string
	username: string
	password: string
	tls: "enforced" | "on" | "off"
}

export const PostgresDatabaseConfig: ZodType<PostgresDatabaseConfig> = z.strictInterface({
	type: z.literal("postgres"),
	host: z.string().default("127.0.0.1"),
	port: z.number().default(5432),
	database: z.string().default("postgres"),
	username: z.string().default("postgres"),
	password: z.string().default("postgres"),
	tls: z.enum(["enforced", "on", "off"]),
})

export interface KVDatabaseConfig {
	type: "kv"
	location?: string
}

export const KVDatabaseConfig: ZodType<KVDatabaseConfig> = z.strictInterface({
	type: z.literal("kv"),
	location: z.string().optional(),
})

export type DatabaseConfig =
	| PostgresDatabaseConfig
	| KVDatabaseConfig

export const DatabaseConfig: ZodType<DatabaseConfig> = z.discriminatedUnion([
	PostgresDatabaseConfig as z.$ZodTypeDiscriminable,
	KVDatabaseConfig as z.$ZodTypeDiscriminable,
]) as unknown as ZodType<DatabaseConfig>

/**
 * Configs regarding how secrets are stored
 */
export interface Storage {
	/** Max size a new secret is allowed to have (in bytes) */
	maxSize: number

	/** Interval in seconds in which the garbage collector should run */
	gcInterval: number

	/** Configure the database where secrets are actually stored */
	database: DatabaseConfig
}

export const Storage: ZodType<Storage> = z.strictInterface({
	maxSize: z.string()
		.regex(/^(\d+)(Ki|Mi|Gi|K|M|G)$/, {
			error: "Invalid size. Expected: positive integer or string with format <num>(Ki|Mi|Gi|K|M|G) e.g 10Gi",
		})
		.transform(transformSize).or(z.uint32())
		.default(transformSize("10Mi")),
	gcInterval: z.uint32().default(60 * 60),
	database: DatabaseConfig.default(DatabaseConfig.parse({ type: "kv" })),
})
