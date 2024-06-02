import { IS_BROWSER } from "$fresh/runtime.ts"
import Result from "@nihility-io/result"
import { config } from "config"
import { logCG, logSecrets } from "log"
import {
	NewSecret,
	parseModel,
	Secret,
	SecretMetadata,
	SecretParseError,
	SecretPolicyError,
	SecretSizeLimitError,
} from "secret/models"
import { initStorage, SecretStorage } from "./storage/mod.ts"

/**
 * Singleton class for managing secret in the backend
 */
export class Secrets {
	#backend: SecretStorage
	static #instance?: Secrets = undefined

	constructor() {
		this.#backend = initStorage(config.storage.backend)

		// Schedule the garbage collector to run every hour in the background.
		// The garbage collector deletes expired secrets
		setInterval(() => {
			this.garbageCollection()
		}, 1000 * config.storage.gcInterval)
	}

	/**
	 * Get the singleton instance of the secret manager
	 */
	static get shared(): Secrets {
		if (IS_BROWSER) {
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
		// Go through all secrets
		for await (const s of Secrets.#instance!.#backend.getSecrets()) {
			if (!s.isSuccess()) {
				logCG.error(s.unwrapError())
				console.log(s.unwrapError())
				continue
			}

			// Check if the secret has expired or is burned
			if (s.value.expires < new Date() || s.value.remainingReads === 0) {
				const res = await this.#backend.deleteSecret(s.value.id)
				if (!res.isSuccess()) {
					logCG.error(`Unable to delete secret #${s.value.id}. Reason: ${res.unwrapError().message}`, {
						id: s.value.id,
					})
				} else {
					logCG.info(`Deleted secret #${s.value.id}`, { id: s.value.id })
				}
			}
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
							path: ["expires"],
							message: `${m.expires} is not a valid value. Use one of the following: ${
								Object.keys(config.expires).join(", ")
							}`,
						}]),
					)
				}

				const id: string = crypto.randomUUID()

				// Store the secret
				const res = await this.#backend.insertSecret({
					id,
					data: m.data,
					expires,
					remainingReads: m.burnAfter,
					passwordProtected: m.passwordProtected,
				}).then(Result.map((x) => x.id))

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

				return res
			})
	}

	/**
	 * Loads the given secret if it's still valid. If not delete it
	 * immediately.
	 * @param id Secret ID
	 * @returns Result with secret
	 */
	getSecretIfValid(id: string) {
		return this.#backend.getSecret(id).then(Result.map((secret) => {
			if (secret.expires < new Date() || secret.remainingReads === 0) {
				// Deletion can be done in the background. No reason to wait.
				this.deleteSecret(secret.id)
				return Result.failure<Secret>(
					`A secret with the ID ${secret.id} does not exist.`,
				)
			}

			return Result.success(secret)
		}))
	}

	/**
	 * Loads metadata for the secret (excluding the encrypted data).
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	async getSecretMetadata(id: string): Promise<Result<SecretMetadata>> {
		return (await this.getSecretIfValid(id))
			// Remove the data from the secret
			.map(({ data: _, ...x }) => ({ ...x }))
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
			this.updateSecret(id, { remainingReads: s.value.remainingReads - 1 })
		}

		return s
	}

	/**
	 * Updates the pre-existing secret with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecret(id: string, secret: Partial<Secret>) {
		const res = await this.#backend.updateSecret(id, secret)
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
		const res = await this.#backend.deleteSecret(id)
		if (res.isFailure()) {
			logSecrets.error(`Failed to delete secret #${id}. Reason: ${res.error.message}`, {
				id,
				error: { name: res.error.name, message: res.error.message },
			})
		}

		return res
	}
}
