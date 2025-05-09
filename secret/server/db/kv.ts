import { KVDatabaseConfig } from "config"
import { logDB } from "log"
import {
	Secret,
	SecretAlreadyExistsError,
	SecretCreateError,
	SecretDeleteError,
	SecretListError,
	SecretMetadata,
	SecretMutableMetadata,
	SecretNotFoundError,
	SecretReadError,
	SecretUpdateError,
} from "secret/models"
import { Database } from "./shared.ts"

/**
 * Secret storage implementation which stores secrets in Deno KV (local or network)
 */
export class KVDatabase implements Database {
	#location?: string
	#kv!: Deno.Kv

	/**
	 * Creates and secret storage instance which stores secrets in Deno KV (local or network)
	 * @param cfg Config
	 */
	constructor(cfg: KVDatabaseConfig) {
		this.#location = cfg.location
	}

	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	async init(): Promise<void> {
		this.#kv = await Deno.openKv(this.#location)
	}

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	async *getSecrets(): AsyncGenerator<SecretMetadata, void, unknown> {
		try {
			for await (const e of this.#kv.list({ prefix: ["secrets"] })) {
				yield await SecretMetadata.parseAsync(e.value)
			}
		} catch (e) {
			logDB.error(`Failed to list secrets.`, e)
			throw new SecretListError()
		}
	}

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	async secretExists(id: string): Promise<boolean> {
		try {
			return await this.#kv.get(["secrets", id])
				.then((res) => res.value !== null)
		} catch {
			return false
		}
	}

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecret(id: string): Promise<Secret> {
		const res = await this.#kv.get<Secret>(["secrets", id])
			.catch(() => ({ key: [], value: null, versionstamp: null } satisfies Deno.KvEntryMaybe<Secret>))

		if (res.value === null) {
			throw new SecretNotFoundError(id)
		}

		try {
			return await Secret.parseAsync(res.value)
		} catch (e) {
			logDB.error(`Failed to read secret.`, e)
			throw new SecretReadError(id)
		}
	}

	/**
	 * Gets the metadata for the secret with the specified ID
	 * @param id Secret ID
	 */
	async getSecretMetadata(id: string): Promise<SecretMetadata> {
		return await this.getSecret(id)
			.then(({ data: _, ...metadata }) => SecretMetadata.parseAsync(metadata))
	}

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	async insertSecret(secret: Secret): Promise<void> {
		if (await this.secretExists(secret.id)) {
			throw new SecretAlreadyExistsError(secret.id)
		}

		const success = await this.#kv.set(["secrets", secret.id], secret)
			.then((x) => x.ok)
			.catch(() => false)

		if (!success) {
			logDB.error(`Failed to write secret`)
			throw new SecretCreateError(secret.id)
		}
	}

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	async updateSecretMetadata(id: string, patch: Partial<SecretMutableMetadata>): Promise<void> {
		const res = await this.getSecret(id)
		const secret = { ...res, ...patch }

		const success = await this.#kv.set(["secrets", secret.id], secret)
			.then((x) => x.ok)
			.catch(() => false)

		if (!success) {
			logDB.error(`Failed to write secret.`)
			throw new SecretUpdateError(secret.id)
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
			await this.#kv.delete(["secrets", id])
		} catch (e) {
			logDB.error(`Failed to delete secret.`, e)
			throw new SecretDeleteError(id)
		}
	}
}
