import { ClientOptions, Pool, QueryArrayResult, QueryObjectResult } from "@db/postgres"
import { config, PostgresDatabaseConfig } from "config"
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
	#options: ClientOptions
	#pool: Pool

	/**
	 * Creates and secret storage instance which stores secrets in PostgreSQL using jsonb
	 * @param cfg Config
	 */
	constructor(cfg: PostgresDatabaseConfig) {
		this.#options = {
			applicationName: config.branding.appName,
			hostname: cfg.host,
			port: cfg.port,
			database: cfg.database,
			user: cfg.username,
			password: cfg.password,
			tls: {
				enabled: cfg.tls === "on" || cfg.tls === "enforced",
				enforce: cfg.tls === "enforced",
			},
			connection: {
				attempts: 1,
			},
		}
		this.#pool = new Pool(this.#options, 5, false)
	}

	/**
	 * Executed queries and retrieve the data as object entries. It supports
	 * a generic in order to type the entries retrieved by the query.
	 * @param query Query
	 * @returns Result returned by Postgres
	 */
	async #query<T = Record<string, unknown>>(
		strings: TemplateStringsArray,
		...args: unknown[]
	): Promise<QueryObjectResult<T>> {
		using client = await this.#pool.connect()
		return await client.queryObject(strings, ...args)
	}

	/**
	 * Execute queries and retrieve the data as array entries. It supports
	 * a generic in order to type the entries retrieved by the query.
	 * @param query Query
	 * @returns Result returned by Postgres
	 */
	async #queryRaw<T extends Array<unknown>>(
		strings: TemplateStringsArray,
		...args: unknown[]
	): Promise<QueryArrayResult<T>> {
		using client = await this.#pool.connect()
		return await client.queryArray(strings, ...args)
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<void> {
		await this.#queryRaw /*sql*/`
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
			const res = await this.#query<SecretRow> /*sql*/`select
				id, expires, remaining_reads, password_protected
			from secrets`

			for (const e of res.rows) {
				yield await PostgresDatabase.#metadataFromRow(e)
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
			const res = await this.#query<SecretRow> /*sql*/`select 1 from secrets where id = ${id}`
			return res.rowCount === 1
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
			const res = await this.#query<SecretRow> /*sql*/`select * from secrets where id = ${id}`
			if (res.rowCount === 0) {
				throw new SecretNotFoundError(id)
			}

			return await PostgresDatabase.#secretFromRow(res.rows[0])
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
			const res = await this.#query<SecretRow> /*sql*/`select
				id, expires, remaining_reads, password_protected
			from secrets where id = ${id}`

			if (res.rowCount === 0) {
				throw new SecretNotFoundError(id)
			}

			return await PostgresDatabase.#metadataFromRow(res.rows[0])
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
			await this.#queryRaw /*sql*/`insert into secrets (
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

			await this.#query<SecretRow> /*sql*/`update secrets set
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
			await this.#queryRaw /*sql*/`delete from secrets where id = ${id}`
		} catch (e) {
			logDB.error(`Failed to delete secret.`, e)
			throw new SecretDeleteError(id)
		}
	}
}
