import { DatabaseConfig } from "config"
import { KVDatabase } from "./kv.ts"
import { PostgresDatabase } from "./postgres.ts"
import { Database } from "./shared.ts"

export { KVDatabase as DenoKVDatabase } from "./kv.ts"
export { PostgresDatabase } from "./postgres.ts"
export type { Database } from "./shared.ts"

/**
 * Initializes the configured database instance
 * @param cfg Database config
 * @returns Database instance
 */
export const initDatabase = (cfg: DatabaseConfig): Database => {
	switch (cfg.type) {
		case "kv":
			return new KVDatabase(cfg)
		case "postgres":
			return new PostgresDatabase(cfg)
	}
}
