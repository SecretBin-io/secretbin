import Result from "@nihility-io/result"
import { KVBackend } from "config"
import { logDB } from "log"
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

/**
 * Secret storage implementation which stores secrets in Deno KV (local or network)
 */
export class SecretKVStorage implements SecretStorage {
	#location?: string
	#kv!: Deno.Kv

	/**
	 * Creates and secret storage instance which stores secrets in Deno KV (local or network)
	 * @param cfg Config
	 */
	constructor(cfg: KVBackend) {
		this.#location = cfg.location
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<boolean> {
		try {
			this.#kv = await Deno.openKv(this.#location)
		} catch (e: unknown) {
			const err = e as Error
			logDB.error(`Failed to initialize Deno KV backend. Reason: ${err.message}`, {
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
		try {
			for await (const e of this.#kv.list({ prefix: ["secrets"] })) {
				try {
					yield Result.success(await Secret.parseAsync(e.value))
				} catch (_e) {
					yield Result.failure(new SecretListExistsError())
				}
			}
		} catch (e: unknown) {
			const err = e as Error
			logDB.error(`Failed to list secrets. Reason: ${err.message}`, {
				error: { name: err.name, message: err.message },
			})
			yield Result.failure(new SecretListExistsError())
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	async secretExists(id: string): Promise<boolean> {
		const res = await Result.fromPromise(
			this.#kv.get(["secrets", id])
				.then((res) => res.value !== null),
		)
		return res.isSuccess() && res.value
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Result<Secret>> {
		const res = await Result.fromPromise(this.#kv.get<Secret>(["secrets", id]))

		if (!res.isSuccess() || res.value.value === null) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			return Result.success(await Secret.parseAsync(res.value.value))
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
		if (await this.secretExists(secret.id)) {
			return Result.failure(new SecretAlreadyExistsError(secret.id))
		}

		try {
			const success = await this.#kv.set(["secrets", secret.id], secret)
				.then((x) => x.ok)

			if (!success) {
				return Result.failure(new SecretWriteError(secret.id))
			}
		} catch (e) {
			logDB.error(`Failed to write secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
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

		try {
			const success = await this.#kv.set(["secrets", secret.id], secret)
				.then((x) => x.ok)

			if (!success) {
				return Result.failure(new SecretWriteError(secret.id))
			}
		} catch (e) {
			logDB.error(`Failed to write secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
		}

		return Result.success(secret)
	}

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	async deleteSecret(id: string): Promise<Result<string>> {
		const exists = await this.secretExists(id)
		if (!exists) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			await this.#kv.delete(["secrets", id])
			return Result.success(id)
		} catch (e) {
			logDB.error(`Failed to delete secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretDeleteError(id))
		}
	}
}
