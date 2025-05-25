import { sizeToBytes } from "helpers"
import z, { ZodType } from "zod"

export interface PostgresDatabaseConfig {
	type: "postgres"
	host: string
	port: number
	database: string
	username: string
	password: string
	tls: "require" | "prefer" | "off"
}

export const PostgresDatabaseConfig: ZodType<PostgresDatabaseConfig> = z.strictInterface({
	type: z.literal("postgres"),
	host: z.string().default(""),
	port: z.number().default(5432),
	database: z.string().default(""),
	username: z.string().default(""),
	password: z.string().default(""),
	tls: z.enum(["require", "prefer", "off"]).default("off"),
})

// export type DatabaseConfig = PostgresDatabaseConfig | OtherDatabaseConfig

// export const DatabaseConfig: ZodType<DatabaseConfig> = z.discriminatedUnion([
// 	PostgresDatabaseConfig as z.$ZodTypeDiscriminable,
// 	OtherDatabaseConfig as z.$ZodTypeDiscriminable,
// ]) as unknown as ZodType<DatabaseConfig>

export type DatabaseConfig = PostgresDatabaseConfig

export const DatabaseConfig = PostgresDatabaseConfig

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
		.transform(sizeToBytes).or(z.uint32())
		.default(sizeToBytes("10Mi")),
	gcInterval: z.uint32().default(60 * 60),
	database: DatabaseConfig.default(DatabaseConfig.parse({ type: "postgres" })),
})
