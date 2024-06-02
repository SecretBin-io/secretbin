import { z } from "zod"

export interface PostgresBackend {
	type: "postgres"
	host: string
	port: number
	database: string
	username: string
	password: string
}

export const PostgresBackend = z.object({
	type: z.literal("postgres"),
	host: z.string().default("127.0.0.1"),
	port: z.number().default(5432),
	database: z.string().default("postgres"),
	username: z.string().default("postgres"),
	password: z.string().default("postgres"),
}).strict()

export interface FileSystemBackend {
	type: "filesystem"
	path: string
}

export const FileSystemBackend = z.object({
	type: z.literal("filesystem"),
	path: z.string().default("/data"),
}).strict()

export interface KVBackend {
	type: "kv"
	location?: string
}

export const KVBackend = z.object({
	type: z.literal("kv"),
	location: z.string().optional(),
}).strict()

export const BackendConfig = z.discriminatedUnion("type", [PostgresBackend, FileSystemBackend, KVBackend])
export type BackendConfig =
	| PostgresBackend
	| FileSystemBackend
	| KVBackend
