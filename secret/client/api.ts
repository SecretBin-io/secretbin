import Result from "@nihility-io/result"
import { NewSecret, Secret, SecretMetadata } from "secret/models"
import { z } from "zod"

/**
 * Stores a new secret in the backend
 * @param secret Secret
 * @returns ID of the newly created secret
 */
export const createSecret = (secret: NewSecret): Promise<Result<string>> =>
	fetch("/api/secret", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(secret),
	}).then((x) => x.text()).then((x) => Result.fromJson(x, z.string()))

/**
 * Fetches metadata for the secret (excluding the encrypted data).
 * Fetching the metadata does not decrease the remaining reads counter.
 * @param id Secret ID
 * @returns Secret metadata
 */
export const getSecretMetadata = (id: string): Promise<Result<SecretMetadata>> =>
	fetch(`/api/secret/${id}`)
		.then((x) => x.text())
		.then((x) => Result.fromJson(x, SecretMetadata))

/**
 * Fetches the secret (including the encrypted data).
 * Fetching the secret decreases the remaining reads counter and deletes
 * the secret if burn is enabled.
 * @param id Secret ID
 * @returns Secret metadata
 */
export const getSecret = (id: string): Promise<Result<Secret>> =>
	fetch(`/api/secret/${id}`, { method: "POST" })
		.then((x) => x.text())
		.then((x) => Result.fromJson(x, Secret))

/**
 * Deletes the secret from the backend
 * @param id Secret ID
 */
export const deleteSecret = (id: string): Promise<Result<void>> =>
	fetch(`/api/secret/${id}`, { method: "DELETE" })
		.then((x) => x.text())
		.then((x) => Result.fromJson(x, z.string()))
		.then(Result.map(() => {}))
