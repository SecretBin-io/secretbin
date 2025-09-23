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

export interface Secret extends SecretMetadata, SecretData {}

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
	data: string | Uint8Array<ArrayBuffer>
}

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
