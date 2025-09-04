import z, { ZodType } from "@zod/zod"
import { parseModel, Secret, SecretMetadata, SecretRequest } from "models"
import { decodeError } from "utils/errors"

interface APICallOptions {
	/**
	 * HTTP method to use for the API call
	 * @default "GET"
	 */
	method?: "GET" | "PUT" | "POST" | "DELETE"

	/**
	 * Body to send with the API call
	 */
	body?: unknown
}

/**
 * Makes an API call to the backend and parses the response
 * @param path API path
 * @param model Zod model to parse the response
 * @param options Options for the API call
 * @returns Parsed response
 */
async function apiCall<T>(path: string, model: ZodType<T>, options: APICallOptions = {}): Promise<T> {
	const res = await fetch(path, {
		method: options.method || "GET",
		headers: options.body ? { "Content-Type": "application/json" } : {},
		body: options.body ? JSON.stringify(options.body) : undefined,
	})

	if (res.status === 200) {
		return res.json().then((x) => parseModel(model, x))
	}

	return res.json().then((x) => Promise.reject(decodeError(x)))
}

/**
 * Stores a new secret in the backend
 * @param secret Secret
 * @returns ID of the newly created secret
 */
export function createSecret(secret: SecretRequest): Promise<string> {
	return apiCall("/api/secret", z.object({ id: z.string() }), {
		method: "POST",
		body: secret,
	}).then((x) => x.id)
}

/**
 * Fetches metadata for the secret (excluding the encrypted data).
 * Fetching the metadata does not decrease the remaining reads counter.
 * @param id Secret ID
 * @returns Secret metadata
 */
export function getSecretMetadata(id: string): Promise<SecretMetadata> {
	return apiCall(`/api/secret/${id}`, SecretMetadata)
}

/**
 * Fetches the secret (including the encrypted data).
 * Fetching the secret decreases the remaining reads counter and deletes
 * the secret if burn is enabled.
 * @param id Secret ID
 * @returns Secret metadata
 */
export function getSecret(id: string): Promise<Secret> {
	return apiCall(`/api/secret/${id}`, Secret, {
		method: "POST",
	})
}

/**
 * Deletes the secret from the backend
 * @param id Secret ID
 */
export function deleteSecret(id: string): Promise<void> {
	return apiCall(`/api/secret/${id}`, z.string(), {
		method: "DELETE",
	}).then(() => {})
}
