import Result from "@nihility-io/result"
import { config } from "config"
import { logCG, logSecrets } from "log"
import {
	NewSecret,
	parseModel,
	Secret,
	SecretMetadata,
	SecretMutableMetadata,
	SecretParseError,
	SecretPolicyError,
	SecretSizeLimitError,
} from "secret/models"
import { Database, initDatabase } from "./db/mod.ts"

/**
 * Singleton class for managing secret in the backend
 */
export class Secrets {
	#db: Database
	static #instance?: Secrets = undefined

	constructor() {
		this.#db = initDatabase(config.storage.database)
	}

	/**
	 * Initializes the secret manager
	 */
	async init(): Promise<boolean> {
		// Initialize the backend
		if (!(await this.#db.init())) {
			return false
		}

		// Schedule the garbage collector to run every hour in the background.
		// The garbage collector deletes expired secrets
		setInterval(() => {
			this.garbageCollection()
		}, 1000 * config.storage.gcInterval)

		this.garbageCollection()

		return true
	}

	/**
	 * Get the singleton instance of the secret manager
	 */
	static get shared(): Secrets {
		if (typeof document !== "undefined") {
			throw new Error("[BUG]: The secrets class is not meant to be called by the browser.")
		}

		if (!Secrets.#instance) {
			Secrets.#instance = new Secrets()
		}

		return Secrets.#instance
	}

	/**
	 * Deletes expired secrets. The garbage collector is schedule to run
	 * every hour in the background but it can also be called manually.
	 */
	async garbageCollection() {
		try {
			// Go through all secrets
			for await (const s of Secrets.#instance!.#db.getSecrets()) {
				// Check if the secret has expired or is burned
				if (s.expires < new Date() || s.remainingReads === 0) {
					try {
						await this.#db.deleteSecret(s.id)
						logCG.info(`Deleted secret #${s.id}`, { id: s.id })
					} catch (e) {
						logCG.error(
							`Unable to delete secret #${s.id}. Reason: ${(e as Error).message}`,
							{
								id: s.id,
							},
						)
					}
				}
			}
		} catch (e) {
			logCG.error(e as Error)
		}
	}

	/**
	 * Converts a duration into an expiration date
	 * @param duration Duration e.g. 5min
	 * @returns Expiration date
	 */
	static getExpireDate(duration: string): Date | undefined {
		// Check if the duration is an configured duration and
		// converts the duration into seconds
		const s = config.expires[duration].seconds
		if (!s) {
			return undefined
		}

		// Add the duration to the current time
		return new Date(new Date().getTime() + s * 1000)
	}

	/**
	 * Parses and stores the provided secret
	 * @param secret Secret
	 * @returns ID of the created secret
	 */
	createSecret(secret: NewSecret): Promise<Result<string>> {
		if (secret.data.data.length > config.storage.maxSize) {
			return Promise.resolve(Result.failure(
				new SecretSizeLimitError(secret.data.data.length, config.storage.maxSize),
			))
		}

		// Validate the secret again the Zod model
		return parseModel<typeof NewSecret, NewSecret>(NewSecret, secret)
			.mapAsync(async (m) => {
				// Ensure that the secrets fulfills the configured policies
				if (config.policy.denySlowBurn && m.burnAfter > 1) {
					return Result.failure(new SecretPolicyError(`Slow burn is not allowed.`))
				}

				if (config.policy.requireBurn && m.burnAfter === -1) {
					return Result.failure(new SecretPolicyError(`Burn is required.`))
				}

				if (config.policy.requirePassword && !m.passwordProtected) {
					return Result.failure(new SecretPolicyError(`Password is required.`))
				}

				// Validate the expires duration and turn it into an expiration date
				const expires = Secrets.getExpireDate(m.expires)
				if (!expires) {
					return Result.failure(
						new SecretParseError([{
							code: "custom",
							input: m.expires,
							path: ["expires"],
							message: `${m.expires} is not a valid value. Use one of the following: ${
								Object.keys(config.expires).join(", ")
							}`,
						}]),
					)
				}

				const id: string = crypto.randomUUID()

				// Store the secret
				const res = await Result.fromPromise(this.#db.insertSecret({
					id,
					data: m.data,
					expires,
					remainingReads: m.burnAfter,
					passwordProtected: m.passwordProtected,
				}))

				if (res.isFailure()) {
					logSecrets.info(`Failed to create a new secret #${id}. Reason: ${res.error.message}`, {
						id,
						action: "create",
						error: { name: res.error.name, message: res.error.message },
					})
				} else {
					logSecrets.info(`Create a new secret #${id} that expires ${expires.toISOString()}`, {
						id,
						expires,
						action: "create",
					})
				}

				return Result.success(id)
			})
	}

	removeIfInvalid<T extends SecretMetadata>(): (r: Result<T>) => Result<T> {
		return Result.map((secret: T) => {
			if (secret.expires < new Date() || secret.remainingReads === 0) {
				// Deletion can be done in the background. No reason to wait.
				this.deleteSecret(secret.id)
				return Result.failure<T>(
					`A secret with the ID ${secret.id} does not exist.`,
				)
			}

			return Result.success(secret)
		})
	}

	/**
	 * Loads the given secret if it's still valid. If not delete it
	 * immediately.
	 * @param id Secret ID
	 * @returns Result with secret
	 */
	getSecretIfValid(id: string): Promise<Result<Secret>> {
		return Result.fromPromise(this.#db.getSecret(id)).then(this.removeIfInvalid())
	}

	/**
	 * Loads the given secret metadata if it's still valid. If not delete it
	 * immediately.
	 * @param id Secret ID
	 * @returns Result with secret
	 */
	getSecretMetadataIfValid(id: string): Promise<Result<SecretMetadata>> {
		return Result.fromPromise(this.#db.getSecretMetadata(id)).then(this.removeIfInvalid())
	}

	/**
	 * Loads metadata for the secret (excluding the encrypted data).
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	async getSecretMetadata(id: string): Promise<Result<SecretMetadata>> {
		return (await this.getSecretMetadataIfValid(id))
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	secretExists(id: string): Promise<boolean> {
		return this.#db.secretExists(id)
	}

	/**
	 * Loads the secret (including the encrypted data). It also deletes the
	 * secret if it is burned.
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	async getSecret(id: string): Promise<Result<Secret>> {
		const s = await this.getSecretIfValid(id)
		if (!s.isSuccess()) {
			return s
		}

		logSecrets.info(`Secret #${id} was opened.`, { action: "get", id })

		if (s.value.remainingReads === 1) {
			this.deleteSecret(id)
		}

		if (s.value.remainingReads !== -1) {
			this.updateSecretMetadata(id, { remainingReads: s.value.remainingReads - 1 })
		}

		return s
	}

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecretMetadata(id: string, secret: Partial<SecretMutableMetadata>) {
		const res = await Result.fromPromise(this.#db.updateSecretMetadata(id, secret))
		if (res.isFailure()) {
			logSecrets.error(`Failed to update secret #${id}. Reason: ${res.error.message}`, {
				id,
				action: "delete",
				error: { name: res.error.name, message: res.error.message },
			})
		}
	}

	/**
	 * Deletes the secret from the backend
	 * @param id Secret ID
	 */
	async deleteSecret(id: string) {
		const res = await Result.fromPromise(this.#db.deleteSecret(id)).then(Result.map(() => id))
		if (res.isFailure()) {
			logSecrets.error(`Failed to delete secret #${id}. Reason: ${res.error.message}`, {
				id,
				error: { name: res.error.name, message: res.error.message },
			})
		}

		return res
	}
}
