import postgres from "@oscar6echo/postgres"
import { PostgresDatabaseConfig } from "config"
import { LocalizedError } from "lang"
import { logDB } from "log"
import {
	EncryptedData,
	EncryptionAlgorithm,
	parseModel,
	Secret,
	SecretAlreadyExistsError,
	SecretCreateError,
	SecretDeleteError,
	SecretListError,
	SecretMetadata,
	SecretMutableMetadata,
	SecretNotFoundError,
	SecretReadError,
	SecretUpdateError,
} from "secret/models"
import { Database } from "./shared.ts"

interface SecretRow {
	id: string
	created_at: Date
	expires: Date
	remaining_reads: number
	password_protected: boolean
	data_iv: string
	data_salt: string
	data_algorithm: string
	data_data: string
}

/**
 * Secret storage implementation which stores secrets in PostgreSQL using jsonb
 */
export class PostgresDatabase implements Database {
	#sql: postgres.Sql

	/**
	 * Creates and secret storage instance which stores secrets in PostgreSQL using jsonb
	 * @param cfg Config
	 */
	constructor(cfg: PostgresDatabaseConfig) {
		this.#sql = postgres({
			host: cfg.host,
			port: cfg.port,
			database: cfg.database,
			username: cfg.username,
			password: cfg.password,
			max: 5,
			idle_timeout: 30000,
			ssl: cfg.tls === "enforced" ? "require" : cfg.tls === "on" ? "prefer" : false,
		})
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<void> {
		await this.#sql /*sql*/`
			create table if not exists secrets (
				id                  uuid        not null primary key,
				created_at          timestamp   not null default now(),
				expires             timestamp   not null,
				remaining_reads     integer     not null,
				password_protected  boolean     not null,
				data_algorithm      text        not null,
				data_iv             text        not null,
				data_salt           text        not null,
				data_data           text        not null
			)
		`
	}

	/**
	 * Creates a secret metadata object from a Postgres row
	 * @param r Postgres row
	 * @returns Secret
	 */
	static #metadataFromRow(r: SecretRow): Promise<SecretMetadata> {
		return parseModel(SecretMetadata, {
			id: r.id,
			expires: r.expires,
			remainingReads: r.remaining_reads,
			passwordProtected: r.password_protected,
		})
	}

	/**
	 * Creates a secret object from a Postgres row
	 * @param r Postgres row
	 * @returns Secret
	 */
	static async #secretFromRow(r: SecretRow): Promise<Secret> {
		try {
			const metadata = await this.#metadataFromRow(r)
			const data = await parseModel(EncryptedData, {
				iv: r.data_iv,
				salt: r.data_salt,
				algorithm: r.data_algorithm as EncryptionAlgorithm,
				data: r.data_data,
			})
			return { ...metadata, data: data } satisfies Secret
		} catch (e) {
			throw e
		}
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getSecrets(): AsyncGenerator<SecretMetadata, void, unknown> {
		try {
			const res = await this.#sql /*sql*/`select
				id, expires, remaining_reads, password_protected
			from secrets`

			for (const e of res.values()) {
				yield await PostgresDatabase.#metadataFromRow(e as SecretRow)
			}
		} catch (e) {
			logDB.error(`Failed to list secrets.`, e)
			throw e instanceof LocalizedError ? e : new SecretListError()
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	async secretExists(id: string): Promise<boolean> {
		try {
			const res = await this.#sql /*sql*/`select 1 from secrets where id = ${id}`
			return res.count === 1
		} catch {
			return false
		}
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Secret> {
		try {
			const res = await this.#sql /*sql*/`select * from secrets where id = ${id}`
			if (res.count === 0) {
				throw new SecretNotFoundError(id)
			}

			return await PostgresDatabase.#secretFromRow([...res.values()][0] as SecretRow)
		} catch (e) {
			logDB.error(`Failed to read secrets.`, e)
			throw e instanceof LocalizedError ? e : new SecretReadError(id)
		}
	}

	/**
	 * Gets the metadata for the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecretMetadata(id: string): Promise<SecretMetadata> {
		try {
			const res = await this.#sql /*sql*/`select
				id, expires, remaining_reads, password_protected
			from secrets where id = ${id}`

			if (res.count === 0) {
				throw new SecretNotFoundError(id)
			}

			return await PostgresDatabase.#metadataFromRow([...res.values()][0] as SecretRow)
		} catch (e) {
			logDB.error(`Failed to read secrets.`, e)
			throw e instanceof LocalizedError ? e : new SecretReadError(id)
		}
	}

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	async insertSecret(secret: Secret): Promise<void> {
		const exists = await this.secretExists(secret.id)
		if (exists) {
			throw new SecretAlreadyExistsError(secret.id)
		}

		try {
			await this.#sql /*sql*/`insert into secrets (
                id,
                expires,
                remaining_reads,
                password_protected,
                data_algorithm,
                data_iv,
                data_salt,
                data_data
            ) values (
                ${secret.id},
                ${secret.expires},
                ${secret.remainingReads},
                ${secret.passwordProtected},
                ${secret.data.algorithm},
                ${secret.data.iv},
                ${secret.data.salt},
                ${secret.data.data}
            )`
		} catch (e) {
			logDB.error(`Failed to insert secrets.`, e)
			throw e instanceof LocalizedError ? e : new SecretCreateError(secret.id)
		}
	}

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecretMetadata(id: string, patch: Partial<SecretMutableMetadata>): Promise<void> {
		try {
			const res = await this.getSecretMetadata(id)

			await this.#sql /*sql*/`update secrets set
                expires             = ${patch.expires ?? res.expires},
                remaining_reads     = ${patch.remainingReads ?? res.remainingReads}
            where id = ${id}`
		} catch (e) {
			logDB.error(`Failed to update secrets.`, e)
			throw e instanceof LocalizedError ? e : new SecretUpdateError(id)
		}
	}

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	async deleteSecret(id: string): Promise<void> {
		const exists = await this.secretExists(id)
		if (!exists) {
			throw new SecretNotFoundError(id)
		}

		try {
			await this.#sql /*sql*/`delete from secrets where id = ${id}`
		} catch (e) {
			logDB.error(`Failed to delete secret.`, e)
			throw new SecretDeleteError(id)
		}
	}
}
