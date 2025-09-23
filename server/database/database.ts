import { decodeHex, encodeHex } from "@std/encoding/hex"
import postgres from "postgres"
import { DatabaseConfig } from "server/config"
import { Events, Secrets } from "server/database/models"

/**
 * Secret storage implementation which stores secrets in PostgreSQL
 */
export class Database {
	#sql: postgres.Sql
	#events: Events
	#secrets: Secrets

	/**
	 * Creates and secret storage instance which stores secrets in PostgreSQL
	 * @param cfg Config
	 */
	constructor(cfg: DatabaseConfig) {
		this.#sql = postgres({
			host: cfg.host,
			port: cfg.port,
			database: cfg.database,
			username: cfg.username,
			password: cfg.password,
			max: 5,
			idle_timeout: 30000,
			ssl: cfg.tls === "off" ? undefined : cfg.tls,
			types: {
				bytea: {
					to: 17,
					from: [17],
					serialize: (x: Uint8Array) => "\\x" + encodeHex(x),
					parse: (x: string) => decodeHex(x.slice(2)),
				},
			},
		})
		this.#events = new Events(this.#sql)
		this.#secrets = new Secrets(this.#sql)
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<void> {
		await this.#secrets.init()
		await this.#events.init()
	}

	/**
	 * Get the events storage
	 */
	get events(): Events {
		return this.#events
	}

	/**
	 * Get the secrets storage
	 */
	get secrets(): Secrets {
		return this.#secrets
	}
}
