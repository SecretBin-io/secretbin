import { BackendConfig } from "config"
import { SecretFileSystemStorage } from "./filesystem.ts"
import { SecretKVStorage } from "./kv.ts"
import { SecretPostgresStorage } from "./postgres.ts"
import { SecretStorage } from "./shared.ts"
import { SecretPostgres2Storage } from "./postgres2.ts"

export { SecretFileSystemStorage } from "./filesystem.ts"
export { SecretKVStorage } from "./kv.ts"
export { SecretPostgresStorage } from "./postgres.ts"
export type { SecretStorage } from "./shared.ts"

/**
 * Initializes the configured storage instance
 * @param cfg Storage config
 * @returns Storage instance
 */
export const initStorage = (cfg: BackendConfig): SecretStorage => {
	switch (cfg.type) {
		case "kv":
			return new SecretKVStorage(cfg)
		case "filesystem":
			return new SecretFileSystemStorage(cfg)
		case "postgres":
			return new SecretPostgresStorage(cfg)
		case "postgres2":
			return new SecretPostgres2Storage(cfg)
	}
}
