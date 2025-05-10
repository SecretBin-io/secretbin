import { parseModel, Secret, SecretMetadata, SecretRequest } from "secret/models"
import z, { ZodType } from "zod"
import { decodeError } from "../../helpers/error.ts"

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
const apiCall = <T>(
	path: string,
	model: ZodType<T>,
	options: APICallOptions = {},
): Promise<T> =>
	fetch(path, {
		method: options.method || "GET",
		headers: options.body ? { "Content-Type": "application/json" } : {},
		body: options.body ? JSON.stringify(options.body) : undefined,
	}).then((res) =>
		res.status === 200
			? res.json()
				.then((x) => parseModel(model, x))
			: res.json()
				.then((x) => Promise.reject(decodeError(x)))
	)

/**
 * Stores a new secret in the backend
 * @param secret Secret
 * @returns ID of the newly created secret
 */
export const createSecret = (secret: SecretRequest): Promise<string> =>
	apiCall("/api/secret", z.string(), {
		method: "POST",
		body: secret,
	})

/**
 * Fetches metadata for the secret (excluding the encrypted data).
 * Fetching the metadata does not decrease the remaining reads counter.
 * @param id Secret ID
 * @returns Secret metadata
 */
export const getSecretMetadata = (id: string): Promise<SecretMetadata> => apiCall(`/api/secret/${id}`, SecretMetadata)

/**
 * Fetches the secret (including the encrypted data).
 * Fetching the secret decreases the remaining reads counter and deletes
 * the secret if burn is enabled.
 * @param id Secret ID
 * @returns Secret metadata
 */
export const getSecret = (id: string): Promise<Secret> =>
	apiCall(`/api/secret/${id}`, Secret, {
		method: "POST",
	})

/**
 * Deletes the secret from the backend
 * @param id Secret ID
 */
export const deleteSecret = (id: string): Promise<void> =>
	apiCall(`/api/secret/${id}`, z.string(), {
		method: "DELETE",
	}).then(() => {})
