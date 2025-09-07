/**
 * This file defines all the models used by SecretBin. Models are validated using Zod
 */

import z from "@zod/zod"

/**
 * Encrypted parts of the secret.
 */
export interface SecretData {
	/**
	 * CryptoURL (crypto://?algorithm=...) which specifies the encryption parameters.
	 * In older versions of SecretBin which parameter used to include the encrypted
	 * data itself.
	 */
	data: string

	/**
	 * Encrypted data
	 */
	dataBytes?: Uint8Array | null
}

const SecretData = z.strictObject({
	data: z.string().startsWith("crypto://"),
	dataBytes: z.instanceof(Uint8Array).optional().or(z.null()),
})

/**
 * Payload for uploading a new secret
 */
export interface SecretSubmission extends SecretData {
	/**
	 * Predefined duration after which a secret should be deleted.
	 */
	expires: string

	/**
	 * Number of time a secret can be read before automatically being deleted.
	 */
	burnAfter: number

	/**
	 * Specifies if the data payload is additionally protected by a password.
	 * This is used to determine if the password prompt should be shown.
	 */
	passwordProtected: boolean
}

export const SecretSubmission = z.strictObject({
	...SecretData.shape,
	expires: z.string().check(z.regex(/^(\d+)(min|hr|d|w|m)$/)),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
})

/**
 * Parts of the secret metadata that are mutable.
 */
export interface SecretMutableMetadata {
	/**
	 * Time at which the secrets expires and will be deleted.
	 */
	expires: Date

	/**
	 * Number of remain reads after which the secret is deleted.
	 */
	remainingReads: number
}

export const SecretMutableMetadata = z.strictObject({
	expires: z.union([
		z.string().transform((str) => new Date(str)),
		z.date(),
	]),
	remainingReads: z.number(),
})

/**
 * Secret metadata data without the encrypted data
 */
export interface SecretMetadata extends SecretMutableMetadata {
	/**
	 * UUID identifying the secret.
	 */
	id: string

	/**
	 * Specifies if the data payload is additionally protected by a password.
	 * This is used to determine if the password prompt should be shown.
	 */
	passwordProtected: boolean
}

export const SecretMetadata = z.strictObject({
	...SecretMutableMetadata.shape,
	id: z.string(),
	passwordProtected: z.boolean().default(false),
})

export interface Secret extends SecretMetadata, SecretData {}

export const Secret = z.strictObject({
	...SecretMetadata.shape,
	...SecretData.shape,
})

export interface SecretAttachment {
	/**
	 * Filename
	 */
	name: string

	/**
	 * MIME content type of the file
	 */
	contentType: string

	/**
	 * Base64 encoded or binary data of the file content
	 */
	data: string | Uint8Array
}

export const SecretAttachment = z.strictObject({
	name: z.string(),
	contentType: z.string(),
	data: z.union([z.string(), z.instanceof(Uint8Array)]),
})

export interface SecretContent {
	/**
	 * Secret text
	 */
	message: string

	/**
	 * List of attached files
	 */
	attachments: SecretAttachment[]
}

export const SecretContent = z.strictObject({
	message: z.string(),
	attachments: z.array(SecretAttachment),
})
