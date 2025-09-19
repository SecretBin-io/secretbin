import z, { ZodType } from "@zod/zod"
import * as CBOR from "cbor2"
import { parseModel, Secret, SecretSubmission } from "models"
import { decodeError, ErrorObject } from "utils/errors"
import { decodeBody } from "utils/helpers"

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

	/**
	 * Whether to use CBOR for the request body
	 * @default false
	 */
	useCBOR?: boolean
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
		method: options.method ?? "GET",
		headers: options.body
			? { "Content-Type": options.useCBOR ? "application/cbor" : "application/json" }
			: undefined,
		body: options.body
			? (options.useCBOR ? CBOR.encode(options.body) as unknown as ArrayBuffer : JSON.stringify(options.body))
			: undefined,
	})

	if (res.status === 200) {
		return decodeBody<T>(res).then((x) => parseModel(model, x))
	}

	return decodeBody<ErrorObject>(res).then((x) => Promise.reject(decodeError(x)))
}

/**
 * Stores a new secret in the backend
 * @param secret Secret
 * @returns ID of the newly created secret
 */
export function createSecret(secret: SecretSubmission): Promise<string> {
	return apiCall("/api/secret", z.object({ id: z.string() }), {
		method: "POST",
		body: secret,
		useCBOR: !!secret.dataBytes,
	}).then((x) => x.id)
}

/**
 * Fetches the secret (including the encrypted data).
 * Fetching the secret decreases the remaining reads counter and deletes
 * the secret if burn is enabled.
 * @param id Secret ID
 * @returns Secret metadata
 */
export function getSecret(id: string): Promise<Secret> {
	return apiCall(`/api/secret/${id}`, Secret, { method: "POST" })
}
