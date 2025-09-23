import { Secret, SecretMetadata, SecretMutableMetadata } from "models"
import postgres from "postgres"
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

interface Row {
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

export class Secrets {
	#sql: postgres.Sql

	constructor(sql: postgres.Sql) {
		this.#sql = sql
	}

	async init(): Promise<void> {
		await this.#sql /*sql*/`
            create table if not exists secrets (
				id                  uuid        not null primary key,
				created_at          timestamp   not null default now(),
				expires             timestamp   not null,
				remaining_reads     integer     not null,
				password_protected  boolean     not null,
				data	            text        not null,
				data_bytes			bytea
			)
        `
	}

	/**
	 * Secret from a Postgres row
	 * @param r Postgres row
	 * @param metadataOnly Only extract metadata
	 * @returns Converted secret metadata
	 */
	#fromRow(r: Row, metadataOnly: true): SecretMetadata
	#fromRow(r: Row, metadataOnly?: false): Secret
	#fromRow(r: Row, metadataOnly?: boolean): Secret | SecretMetadata {
		return {
			id: r.id,
			expires: r.expires,
			remainingReads: r.remaining_reads,
			passwordProtected: r.password_protected,
			data: metadataOnly ? undefined : r.data,
			dataBytes: metadataOnly ? undefined : (r.data_bytes ? r.data_bytes : undefined),
		}
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getAll(): AsyncGenerator<SecretMetadata, void, unknown> {
		try {
			const res = await this.#sql /*sql*/`
				select
                	id, expires, remaining_reads, password_protected
            	from secrets
			`

			for (const e of res.values()) {
				yield this.#fromRow(e as Row, true)
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
	async exists(id: string): Promise<boolean> {
		try {
			const res = await this.#sql /*sql*/`
				select 1
				from secrets
				where id = ${id}
			`
			return res.count === 1
		} catch {
			return false
		}
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async get(id: string): Promise<Secret> {
		try {
			const res = await this.#sql /*sql*/`
				select
                	id, expires, remaining_reads, password_protected, data, data_bytes
            	from secrets where id = ${id}
			`

			if (res.count === 0) {
				throw new SecretNotFoundError(id)
			}

			return this.#fromRow([...res.values()][0] as Row)
		} catch (err) {
			logDB.error(`Failed to read secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretReadError(id)
		}
	}

	/**
	 * Gets the metadata for the secret with the specified ID
	 * @param id Secret ID
	 */
	async getMetadata(id: string): Promise<SecretMetadata> {
		try {
			const res = await this.#sql /*sql*/`
				select
                	id, expires, remaining_reads, password_protected
            	from secrets where id = ${id}
			`

			if (res.count === 0) {
				throw new SecretNotFoundError(id)
			}

			return this.#fromRow([...res.values()][0] as Row, true)
		} catch (err) {
			logDB.error(`Failed to read secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretReadError(id)
		}
	}

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	async insert(secret: Secret): Promise<void> {
		const exists = await this.exists(secret.id)
		if (exists) {
			throw new SecretAlreadyExistsError(secret.id)
		}

		try {
			await this.#sql /*sql*/`
				insert into secrets (
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
               	)
			`
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
	async updateMetadata(id: string, patch: Partial<SecretMutableMetadata>): Promise<void> {
		try {
			const res = await this.getMetadata(id)

			await this.#sql /*sql*/`
				update secrets set
                   expires             = ${patch.expires ?? res.expires},
                   remaining_reads     = ${patch.remainingReads ?? res.remainingReads}
               	where id = ${id}
			`
		} catch (err) {
			logDB.error(`Failed to update secrets.`, { error: err })
			throw err instanceof LocalizedError ? err : new SecretUpdateError(id)
		}
	}

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	async delete(id: string): Promise<void> {
		const exists = await this.exists(id)
		if (!exists) {
			throw new SecretNotFoundError(id)
		}

		try {
			await this.#sql /*sql*/`
				delete
				from secrets
				where id = ${id}
			`
		} catch (err) {
			logDB.error(`Failed to delete secret.`, { error: err })
			throw new SecretDeleteError(id)
		}
	}
}
