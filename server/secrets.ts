import { EventType, Secret, SecretMetadata, SecretMutableMetadata, SecretSubmission } from "models"
import { config } from "server/config"
import { Database } from "server/database"
import { logCG, logDB, logSecrets } from "server/log"
import { SecretNotFoundError, SecretParseError, SecretPolicyError, SecretSizeLimitError } from "utils/errors"

/**
 * Singleton class for managing secret in the backend
 */
export class Secrets {
	#db: Database

	static #instance?: Secrets = undefined

	constructor() {
		this.#db = new Database(config.storage.database)
	}

	/**
	 * Initializes the secret manager
	 */
	async init(): Promise<boolean> {
		try {
			// Initialize the backend
			await this.#db.init()
		} catch (err) {
			logDB.error(`Failed to initialize database.`, { error: err })
			return false
		}

		// Schedule the garbage collector to run every hour in the background.
		// The garbage collector deletes expired secrets
		Deno.cron("GarbageCollector", config.storage.garbageCollection.cron, () => {
			this.#garbageCollection()
		})

		return true
	}

	/**
	 * Get the singleton instance of the secret manager
	 */
	static get shared(): Secrets {
		return Secrets.#instance ??= new Secrets()
	}

	/**
	 * Deletes expired secrets. The garbage collector is schedule to run
	 * every hour in the background but it can also be called manually.
	 */
	async #garbageCollection(): Promise<void> {
		logCG.info(`Running garbage collector...`)
		try {
			// Go through all secrets
			for await (const s of Secrets.#instance!.#db.secrets.getAll()) {
				// Check if the secret has expired or is burned
				if (s.expires < new Date() || s.remainingReads === 0) {
					try {
						await this.#db.events.emit(s.id, EventType.Expired)
						await this.deleteSecret(s.id)
						logCG.info(`Deleted secret #${s.id}.`, { id: s.id })
					} catch (err) {
						logCG.error(`Unable to delete secret #${s.id}.`, { id: s.id, error: err })
					}
				}
			}
		} catch (err) {
			logCG.error(`Failed to collect garbage.`, { error: err })
		}
		logCG.info(`Garbage collector finished.`)
	}

	/**
	 * Removes the secret if it is invalid (expired or burned)
	 * @returns A function that removes the secret if it is invalid (expired or burned)
	 */
	#removeIfInvalid<T extends SecretMetadata>(): (secret: T) => T {
		return (secret: T): T => {
			if (secret.expires < new Date() || secret.remainingReads === 0) {
				// Deletion can be done in the background. No reason to wait.
				this.deleteSecret(secret.id)
					.then(() => this.#db.events.emit(secret.id, EventType.Expired))
				throw new SecretNotFoundError(secret.id)
			}
			return secret
		}
	}

	/**
	 * Converts a duration into an expiration date.
	 * If the duration is invalid, throws an error.
	 * @param duration Duration e.g. 5min
	 * @returns Expiration date
	 */
	static #getExpireDate(duration: string): Date {
		// Check if the duration is an configured duration and
		// converts the duration into seconds
		const s = config.expires[duration].seconds
		if (!s) {
			throw new SecretParseError([{
				code: "custom",
				input: duration,
				path: ["expires"],
				message: `${duration} is not a valid value. Use one of the following: ${
					Object.keys(config.expires).join(", ")
				}`,
			}])
		}

		// Add the duration to the current time
		return new Date(new Date().getTime() + s * 1000)
	}

	/**
	 * Ensures that the provided secret meets the configured policies.
	 * If not, an error is thrown.
	 * @param secret Secret to check
	 */
	#assertMeetsPolicy(secret: SecretSubmission): void {
		const data = secret.dataBytes ? secret.dataBytes : secret.data
		if (data.length > config.storage.maxSize) {
			throw new SecretSizeLimitError(data.length, config.storage.maxSize)
		}

		// Ensure that the secrets fulfills the configured policies
		if (config.policy.denySlowBurn && secret.burnAfter > 1) {
			throw new SecretPolicyError(`Slow burn is not allowed.`)
		}

		if (config.policy.requireBurn && secret.burnAfter === -1) {
			throw new SecretPolicyError(`Burn is required.`)
		}

		if (config.policy.requirePassword && !secret.passwordProtected) {
			throw new SecretPolicyError(`Password is required.`)
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	secretExists(id: string): Promise<boolean> {
		return this.#db.secrets.exists(id)
	}

	/**
	 * Loads the secret (including the encrypted data). It also deletes the
	 * secret if it is burned.
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	async getSecret(id: string): Promise<Secret> {
		const s = await this.#db.secrets.get(id)
			.then(this.#removeIfInvalid())

		logSecrets.info(`Secret #${id} was opened.`, { action: "get", id })
		await this.#db.events.emit(id, EventType.Read)

		if (s.remainingReads === 1) {
			await this.deleteSecret(id)
			await this.#db.events.emit(id, EventType.Burned)
		} else if (s.remainingReads !== -1) {
			await this.updateSecretMetadata(id, { remainingReads: s.remainingReads - 1 })
		}

		return s
	}

	/**
	 * Loads metadata for the secret (excluding the encrypted data).
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	getSecretMetadata(id: string): Promise<SecretMetadata> {
		return this.#db.secrets.getMetadata(id).then(this.#removeIfInvalid())
	}

	/**
	 * Parses and stores the provided secret
	 * @param secret Secret
	 * @returns ID of the created secret
	 */
	async createSecret(secret: SecretSubmission): Promise<string> {
		// Ensure that the secrets fulfills the configured policies
		this.#assertMeetsPolicy(secret)

		// Validate the expires duration and turn it into an expiration date
		const expires = Secrets.#getExpireDate(secret.expires)

		const id = crypto.randomUUID()

		try {
			// Store the secret
			await this.#db.secrets.insert({
				id,
				data: secret.data,
				dataBytes: secret.dataBytes,
				expires,
				remainingReads: secret.burnAfter,
				passwordProtected: secret.passwordProtected,
			})
			await this.#db.events.emit(id, EventType.Created)
			logSecrets.info(
				`Create a new secret #${id} that expires ${expires.toISOString()}`,
				{ id, expires, action: "create" },
			)
		} catch (err) {
			logSecrets.error(`Failed to create a new secret #${id}.`, { id, action: "create", error: err })
			throw err
		}

		return id
	}

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecretMetadata(id: string, secret: Partial<SecretMutableMetadata>): Promise<void> {
		try {
			await this.#db.secrets.updateMetadata(id, secret)
		} catch (err) {
			logSecrets.error(`Failed to update secret #${id}.`, { id, action: "delete", error: err })
			throw err
		}
	}

	/**
	 * Deletes the secret from the backend
	 * @param id Secret ID
	 */
	async deleteSecret(id: string): Promise<void> {
		try {
			await this.#db.secrets.delete(id)
			await this.#db.events.emit(id, EventType.Deleted)
			logSecrets.info(`Deleted secret #${id}.`, { id, action: "delete" })
		} catch (err) {
			throw err
		}
	}
}
