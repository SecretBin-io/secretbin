import { DatabaseConfig } from "config"
import { PostgresDatabase } from "./postgres.ts"
import { Database } from "./shared.ts"

export { PostgresDatabase } from "./postgres.ts"
export type { Database } from "./shared.ts"

/**
 * Initializes the configured database instance
 * @param cfg Database config
 * @returns Database instance
 */
export function initDatabase(cfg: DatabaseConfig): Database {
	switch (cfg.type) {
		case "postgres":
			return new PostgresDatabase(cfg)
	}
}
