import { Secret, SecretMetadata, SecretMutableMetadata } from "secret/models"

export interface Database {
	/**
	 * Initializes the storage. This is called when the server starts.
	 */
	init(): Promise<void>

	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	getSecrets(): AsyncGenerator<SecretMetadata, void, unknown>

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	secretExists(id: string): Promise<boolean>

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	getSecret(id: string): Promise<Secret>

	/**
	 * Gets the metadata for the secret with the specified ID
	 * @param id Secret ID
	 */
	getSecretMetadata(id: string): Promise<SecretMetadata>

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	insertSecret(secret: Secret): Promise<void>

	/**
	 * Updates the pre-existing secret's metadata with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	updateSecretMetadata(id: string, secret: Partial<SecretMutableMetadata>): Promise<void>

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	deleteSecret(id: string): Promise<void>
}
