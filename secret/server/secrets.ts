import { config } from "config"
import { logCG, logDB, logSecrets } from "log"
import {
	parseModel,
	Secret,
	SecretMetadata,
	SecretMutableMetadata,
	SecretNotFoundError,
	SecretParseError,
	SecretPolicyError,
	SecretRequest,
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
		try {
			// Initialize the backend
			await this.#db.init()
		} catch (e) {
			logDB.error(`Failed to initialize database.`, e)
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
	async garbageCollection(): Promise<void> {
		try {
			// Go through all secrets
			for await (const s of Secrets.#instance!.#db.getSecrets()) {
				// Check if the secret has expired or is burned
				if (s.expires < new Date() || s.remainingReads === 0) {
					try {
						await this.#db.deleteSecret(s.id)
						logCG.info(`Deleted secret #${s.id}.`, { id: s.id })
					} catch (e) {
						logCG.error(`Unable to delete secret #${s.id}.`, { id: s.id, error: e })
					}
				}
			}
		} catch (e) {
			logCG.error(`Failed to collect garbage.`, e)
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
	async createSecret(secret: SecretRequest): Promise<string> {
		// Validate the secret again the Zod model
		const m = await parseModel(SecretRequest, secret)

		if (m.data.data.length > config.storage.maxSize) {
			throw new SecretSizeLimitError(m.data.data.length, config.storage.maxSize)
		}

		// Ensure that the secrets fulfills the configured policies
		if (config.policy.denySlowBurn && m.burnAfter > 1) {
			throw new SecretPolicyError(`Slow burn is not allowed.`)
		}

		if (config.policy.requireBurn && m.burnAfter === -1) {
			throw new SecretPolicyError(`Burn is required.`)
		}

		if (config.policy.requirePassword && !m.passwordProtected) {
			throw new SecretPolicyError(`Password is required.`)
		}

		// Validate the expires duration and turn it into an expiration date
		const expires = Secrets.getExpireDate(m.expires)
		if (!expires) {
			throw new SecretParseError([{
				code: "custom",
				input: m.expires,
				path: ["expires"],
				message: `${m.expires} is not a valid value. Use one of the following: ${
					Object.keys(config.expires).join(", ")
				}`,
			}])
		}

		const id: string = crypto.randomUUID()

		try {
			// Store the secret
			await this.#db.insertSecret({
				id,
				data: m.data,
				expires,
				remainingReads: m.burnAfter,
				passwordProtected: m.passwordProtected,
			})
			logSecrets.info(
				`Create a new secret #${id} that expires ${expires.toISOString()}`,
				{ id, expires, action: "create" },
			)
		} catch (e) {
			logSecrets.error(`Failed to create a new secret #${id}.`, { id, action: "create", error: e })
			throw e
		}

		return id
	}

	removeIfInvalid<T extends SecretMetadata>(): (secret: T) => T {
		return (secret: T): T => {
			if (secret.expires < new Date() || secret.remainingReads === 0) {
				// Deletion can be done in the background. No reason to wait.
				this.deleteSecret(secret.id)
				throw new SecretNotFoundError(secret.id)
			}
			return secret
		}
	}

	/**
	 * Loads the given secret if it's still valid. If not delete it
	 * immediately.
	 * @param id Secret ID
	 * @returns Result with secret
	 */
	getSecretIfValid(id: string): Promise<Secret> {
		return this.#db.getSecret(id).then(this.removeIfInvalid())
	}

	/**
	 * Loads the given secret metadata if it's still valid. If not delete it
	 * immediately.
	 * @param id Secret ID
	 * @returns Result with secret
	 */
	getSecretMetadataIfValid(id: string): Promise<SecretMetadata> {
		return this.#db.getSecretMetadata(id).then(this.removeIfInvalid())
	}

	/**
	 * Loads metadata for the secret (excluding the encrypted data).
	 * @param id Secret ID
	 * @returns Secret metadata
	 */
	async getSecretMetadata(id: string): Promise<SecretMetadata> {
		return await this.getSecretMetadataIfValid(id)
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
	async getSecret(id: string): Promise<Secret> {
		const s = await this.getSecretIfValid(id)

		logSecrets.info(`Secret #${id} was opened.`, { action: "get", id })

		if (s.remainingReads === 1) {
			await this.deleteSecret(id)
		} else if (s.remainingReads !== -1) {
			await this.updateSecretMetadata(id, { remainingReads: s.remainingReads - 1 })
		}

		return s
	}

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecretMetadata(id: string, secret: Partial<SecretMutableMetadata>) {
		try {
			await this.#db.updateSecretMetadata(id, secret)
		} catch (e) {
			logSecrets.error(`Failed to update secret #${id}.`, { id, action: "delete", error: e })
			throw e
		}
	}

	/**
	 * Deletes the secret from the backend
	 * @param id Secret ID
	 */
	async deleteSecret(id: string) {
		try {
			await this.#db.deleteSecret(id)
		} catch (e) {
			logSecrets.error(`Failed to delete secret #${id}.`, { id, error: e })
			throw e
		}
	}
}
