import Result from "@nihility-io/result"
import { Postgres2Backend } from "config"
import {  Pool, QueryArrayResult, QueryObjectResult } from "@db/postgres"
import {
	Secret,
	SecretAlreadyExistsError,
	SecretDeleteError,
	SecretListExistsError,
	SecretNotFoundError,
	SecretReadError,
	SecretWriteError,
} from "secret/models"
import { patchObject, SecretStorage } from "./shared.ts"
import { logDB } from "log"

interface SecretRow {
	id: string
	secret: Secret
}

/**
 * Secret storage implementation which stores secrets in PostgreSQL using jsonb
 */
export class SecretPostgres2Storage implements SecretStorage {
	#sql: Pool

	/**
	 * Creates and secret storage instance which stores secrets in PostgreSQL using jsonb
	 * @param cfg Config
	 */
	constructor(cfg: Postgres2Backend) {
		this.#sql = new Pool({
			hostname: cfg.host,
			port: cfg.port,
			database: cfg.database,
			user: cfg.username,
			password: cfg.password,
			connection: {
				attempts: 5,
			},
		}, 5)
	}

	/**
	 * Executed queries and retrieve the data as object entries. It supports
	 * a generic in order to type the entries retrieved by the query.
	 * @param query Query
	 * @returns Result returned by Postgres
	 */
	async #queryObject<T = Record<string, unknown>>(
		strings: TemplateStringsArray,
		...args: unknown[]
	): Promise<QueryObjectResult<T>> {
		using client = await this.#sql.connect()
		return await client.queryObject(strings, ...args)
	}

	/**
	 * Execute queries and retrieve the data as array entries. It supports
	 * a generic in order to type the entries retrieved by the query.
	 * @param query Query
	 * @returns Result returned by Postgres
	 */
	async #queryArray<T extends Array<unknown>>(
		strings: TemplateStringsArray,
		...args: unknown[]
	): Promise<QueryArrayResult<T>> {
		using client = await this.#sql.connect()
		return await client.queryArray(strings, ...args)
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<boolean> {
		try {
			await this.#queryArray`
				create table if not exists Secrets (
					ID uuid primary key,
					Secret jsonb not null,
					CreatedAt timestamp not null default now()
				)
			`
		} catch (e: unknown) {
			const err = e as Error
			logDB.error(`Failed to initialize Postgres backend. Reason: ${err.message}`, {
				error: { name: err.name, message: err.message },
			})
			return false
		}

		return true
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getSecrets(): AsyncGenerator<Result<Secret>, void, unknown> {
		const res = await Result.fromPromise(
			this.#queryObject<SecretRow>`select secret from Secrets`,
		)

		if (!res.isSuccess()) {
			logDB.error(`Failed to list secrets. Reason: ${res.unwrapError().message}`, {
				error: { name: res.unwrapError().name, message: res.unwrapError().message },
			})

			yield Result.failure<Secret>(new SecretListExistsError())
			return
		}

		for (const e of res.value.rows) {
			try {
				yield Result.success(await Secret.parseAsync(e.secret))
			} catch (_e) {
				yield Result.failure(new SecretListExistsError())
			}
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	async exists(id: string): Promise<boolean> {
		const res = await Result.fromPromise(
			this.#queryObject<SecretRow>`select 1 from Secrets where id = ${id}`,
		)

		return res.isSuccess() && res.value.rowCount === 1
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Result<Secret>> {
		const res = await Result.fromPromise(
			this.#queryObject<SecretRow>`select secret from Secrets where id = ${id}`,
		)

		if (res.isFailure()) {
			logDB.error(`Failed to read secret. Reason: ${res.error.message}`, {
				error: { name: res.error.name, message: res.error.message },
			})
		}

		if (!res.isSuccess() || res.value.rowCount === 0) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			return Result.success(await Secret.parseAsync([...res.value.rows][0].secret))
		} catch (e) {
			logDB.error(`Failed to read secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretReadError(id))
		}
	}

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	async insertSecret(secret: Secret): Promise<Result<Secret>> {
		const exists = await this.exists(secret.id)
		if (exists) {
			return Result.failure(new SecretAlreadyExistsError(secret.id))
		}

		const success = await Result.fromPromise(
			this.#queryArray`insert into Secrets (id, secret) values (${secret.id}, ${secret})`,
		)

		if (success.isFailure()) {
			logDB.error(`Failed to read secret. Reason: ${success.error.message}`, {
				error: { name: success.error.name, message: success.error.message },
			})

			return Result.failure(new SecretWriteError(secret.id))
		}

		return Result.success(secret)
	}

	/**
	 * Updates a pre-existing secret
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecret(id: string, patch: Partial<Secret>): Promise<Result<Secret>> {
		const res = await this.getSecret(id)
		if (!res.isSuccess()) {
			return res
		}

		const secret = patchObject(res.value, patch)

		const success = await Result.fromPromise(
			this.#queryObject<SecretRow>`update Secrets set secret = ${secret} where id = ${id}`,
		)

		if (success.isFailure()) {
			logDB.error(`Failed to read secret. Reason: ${success.error.message}`, {
				error: { name: success.error.name, message: success.error.message },
			})
			return Result.failure(new SecretWriteError(secret.id))
		}

		return Result.success(secret)
	}

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	async deleteSecret(id: string): Promise<Result<string>> {
		const exists = await this.exists(id)
		if (!exists) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			await this.#queryArray`delete from Secrets where id = ${id}`
			return Result.success(id)
		} catch (e) {
			logDB.error(`Failed to read secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretDeleteError(id))
		}
	}
}
