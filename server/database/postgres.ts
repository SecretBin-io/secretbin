import { decodeHex, encodeHex } from "@std/encoding/hex"
import z from "@zod/zod"
import { parseModel, Secret, SecretMetadata, SecretMutableMetadata } from "models"
import postgres from "postgres"
import { DatabaseConfig } from "server/config"
import { logDB } from "server/log"
import {
	LocalizedError,
	SecretAlreadyExistsError,
	SecretCreateError,
	SecretDeleteError,
	SecretListError,
	SecretNotFoundError,
	SecretReadError,
	SecretUpdateError,
} from "utils/errors"

interface SecretRow {
	id: string
	// deno-lint-ignore camelcase
	created_at: Date
	expires: Date
	// deno-lint-ignore camelcase
	remaining_reads: number
	// deno-lint-ignore camelcase
	password_protected: boolean
	data: string
	// deno-lint-ignore camelcase
	data_bytes: Uint8Array | null
}

/**
 * Secret storage implementation which stores secrets in PostgreSQL
 */
export class Database {
	#sql: postgres.Sql

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
				data	            text        not null
			)
		`

		await this.#sql /*sql*/`
			alter table secrets add column if not exists data_bytes bytea;
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
			const data = await parseModel(z.string().startsWith("crypto://"), r.data)
			return {
				...metadata,
				data: data,
				dataBytes: r.data_bytes ? r.data_bytes : undefined,
			} satisfies Secret
		} catch (err) {
			throw err
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
				yield await Database.#metadataFromRow(e as SecretRow)
			}
		} catch (err) {
			logDB.error(`Failed to list secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretListError()
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

			return await Database.#secretFromRow([...res.values()][0] as SecretRow)
		} catch (err) {
			logDB.error(`Failed to read secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretReadError(id)
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

			return await Database.#metadataFromRow([...res.values()][0] as SecretRow)
		} catch (err) {
			logDB.error(`Failed to read secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretReadError(id)
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
                data,
                data_bytes
            ) values (
                ${secret.id},
                ${secret.expires},
                ${secret.remainingReads},
                ${secret.passwordProtected},
                ${secret.data},
                ${secret.dataBytes ? secret.dataBytes : null}
            )`
		} catch (err) {
			logDB.error(`Failed to insert secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretCreateError(secret.id)
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
		} catch (err) {
			logDB.error(`Failed to update secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretUpdateError(id)
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
		} catch (err) {
			logDB.error(`Failed to delete secret.`, { error: err })
			throw new SecretDeleteError(id)
		}
	}
}
