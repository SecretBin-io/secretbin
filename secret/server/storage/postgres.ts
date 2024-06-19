import Result from "@nihility-io/result"
import { PostgresBackend } from "config"
import postgres, { Sql } from "postgres"
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

/**
 * Secret storage implementation which stores secrets in PostgreSQL using jsonb
 */
export class SecretPostgresStorage implements SecretStorage {
	#sql: Sql

	/**
	 * Creates and secret storage instance which stores secrets in PostgreSQL using jsonb
	 * @param cfg Config
	 */
	constructor(cfg: PostgresBackend) {
		this.#sql = postgres({
			host: cfg.host,
			port: cfg.port,
			database: cfg.database,
			username: cfg.username,
			password: cfg.password,
			max: 5,
			idle_timeout: 30000,
		})

		// Ensure that the Postgres exists
		this.#sql`create table if not exists Secrets (
			ID uuid primary key,
			Secret jsonb not null,
			CreatedAt timestamp not null default now()
		)`.catch((e) => {
			logDB.error(`Init error. Reason: ${e.message}`, {
				error: { name: e.name, message: e.message },
			})
		})
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getSecrets(): AsyncGenerator<Result<Secret>, void, unknown> {
		const res = await Result.fromPromise(
			this.#sql`select ${this.#sql("secret")} from Secrets`,
		)

		if (!res.isSuccess()) {
			logDB.error(`Failed to list secrets. Reason: ${res.unwrapError().message}`, {
				error: { name: res.unwrapError().name, message: res.unwrapError().message },
			})

			yield Result.failure<Secret>(new SecretListExistsError())
			return
		}

		for (const e of res.value.values()) {
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
			this.#sql`select 1 from Secrets where id = ${id}`,
		)

		return res.isSuccess() && res.value.count === 1
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Result<Secret>> {
		const res = await Result.fromPromise(
			this.#sql`select ${this.#sql("secret")} from Secrets where id = ${id}`,
		)

		if (res.isFailure()) {
			logDB.error(`Failed to read secret. Reason: ${res.error.message}`, {
				error: { name: res.error.name, message: res.error.message },
			})
		}

		if (!res.isSuccess() || res.value.count === 0) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			return Result.success(await Secret.parseAsync([...res.value.values()][0].secret))
		} catch (e) {
			logDB.error(`Failed to read secret. Reason: ${e.message}`, {
				error: { name: e.name, message: e.message },
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
			this.#sql`insert into Secrets ${this.#sql([{ id: secret.id, secret: secret as never }])}`,
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
			this.#sql`update Secrets set ${this.#sql({ secret }, ["secret"])} where id = ${id}`,
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
			await this.#sql`delete from Secrets where id = ${id}`
			return Result.success(id)
		} catch (e) {
			logDB.error(`Failed to read secret. Reason: ${e.message}`, {
				error: { name: e.name, message: e.message },
			})
			return Result.failure(new SecretDeleteError(id))
		}
	}
}
