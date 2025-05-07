import { z } from "zod"

export interface PostgresDatabaseConfig {
	type: "postgres"
	host: string
	port: number
	database: string
	username: string
	password: string
	tls: "enforced" | "on" | "off"
}

export const PostgresDatabaseConfig = z.strictInterface({
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

export const KVDatabaseConfig = z.strictInterface({
	type: z.literal("kv"),
	location: z.string().optional(),
})

export const DatabaseConfig = z.discriminatedUnion([
	PostgresDatabaseConfig,
	KVDatabaseConfig,
])
export type DatabaseConfig =
	| PostgresDatabaseConfig
	| KVDatabaseConfig
