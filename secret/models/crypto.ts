export enum EncryptionAlgorithm {
	AES256GCM = "AES256-GCM",
}

export interface EncryptedData {
	/** Used encryption algorithm */
	algorithm: EncryptionAlgorithm

	/** Base64 encoded initialization vector for encryption */
	iv: string

	/**  Base64 encoded salt for key generation */
	salt: string

	/** Actual encrypted data */
	data: string
}
