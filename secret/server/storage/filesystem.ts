import Result from "@nihility-io/result"
import { exists, existsSync } from "@std/fs"
import * as path from "@std/path"
import { FileSystemBackend } from "config"
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
 * Secret storage implementation which stores secrets in JSON files
 */
export class SecretFileSystemStorage implements SecretStorage {
	#path: string

	/**
	 * Creates and secret storage instance which stores secrets in JSON files
	 * @param cfg Config
	 */
	constructor(cfg: FileSystemBackend) {
		if ((existsSync(cfg.path))) {
			Deno.mkdirSync(cfg.path, { recursive: true })
		}
		this.#path = cfg.path
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getSecrets(): AsyncGenerator<Result<Secret>, void, unknown> {
		try {
			for await (const file of Deno.readDir(this.#path)) {
				if (!file.isFile) {
					continue
				}
				const { name, ext } = path.parse(file.name)
				if (ext !== ".json") {
					continue
				}

				yield await this.getSecret(name)
			}
		} catch (e) {
			logDB.error(`Failed to list secrets. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			yield Result.failure<Secret>(new SecretListExistsError())
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	async exists(id: string): Promise<boolean> {
		const f = path.join(this.#path, `${id}.json`)
		return await exists(f)
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Result<Secret>> {
		const f = path.join(this.#path, `${id}.json`)

		if (!await (exists(f))) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			return Result.success(
				await Deno.readTextFile(f)
					.then(JSON.parse)
					.then(Secret.parseAsync),
			)
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
		const f = path.join(this.#path, `${secret.id}.json`)

		if (await (exists(f))) {
			return Result.failure(new SecretAlreadyExistsError(secret.id))
		}

		try {
			return Result.success(
				await Deno.writeTextFile(f, JSON.stringify(secret))
					.then(() => secret),
			)
		} catch (e) {
			logDB.error(`Failed to write secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretWriteError(secret.id))
		}
	}

	/**
	 * Updates a pre-existing secret
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecret(id: string, patch: Partial<Secret>): Promise<Result<Secret>> {
		const f = path.join(this.#path, `${id}.json`)

		const res = await this.getSecret(id)
		if (!res.isSuccess()) {
			return res
		}

		const secret = patchObject(res.value, patch)

		try {
			return Result.success(
				await Deno.writeTextFile(f, JSON.stringify(secret))
					.then(() => secret),
			)
		} catch (e) {
			logDB.error(`Failed to write secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretWriteError(secret.id))
		}
	}

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	async deleteSecret(id: string): Promise<Result<string>> {
		const f = path.join(this.#path, `${id}.json`)

		if (!await (exists(f))) {
			return Result.failure(new SecretNotFoundError(id))
		}

		try {
			await Deno.remove(f)
			return Result.success(id)
		} catch (e) {
			logDB.error(`Failed to delete secret. Reason: ${(e as Error).message}`, {
				error: { name: (e as Error).name, message: (e as Error).message },
			})
			return Result.failure(new SecretDeleteError(id))
		}
	}
}
