import Result from "@nihility-io/result"
import { deepMerge as deepMergeInternal } from "@std/collections"
import { Secret } from "secret/models"
import { logDB } from "log"

export interface SecretStorage {
	/**
	 * Creates an iterator which goes over all stored secrets
	 */
	getSecrets(): AsyncGenerator<Result<Secret>, void, unknown>

	/**
	 * Checks if a secret with the provided ID exists
	 * @param id Secret ID
	 */
	exists(id: string): Promise<boolean>

	/**
	 * Gets the secret with the specified ID
	 * @param id Secret ID
	 */
	getSecret(id: string): Promise<Result<Secret>>

	/**
	 * Stores an encrypted secret
	 * @param secret Encrypted secret
	 */
	insertSecret(secret: Secret): Promise<Result<Secret>>

	/**
	 * Updates the pre-existing secret with the given ID
	 * @param id Secret ID
	 * @param secret Properties that should be updated
	 */
	updateSecret(id: string, secret: Partial<Secret>): Promise<Result<Secret>>

	/**
	 * Deletes the secret with the given ID
	 * @param id Secret ID
	 */
	deleteSecret(id: string): Promise<Result<string>>
}

/**
 * Overwrites properties on an object with the given patch
 * @param base Base object
 * @param patch New property values
 * @returns Patched object
 */
export const patchObject = <T>(base: T, patch: Partial<T>): T =>
	deepMergeInternal(base as never, patch as Partial<never>) as unknown as T
