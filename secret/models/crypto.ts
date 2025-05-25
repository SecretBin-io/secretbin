import z from "zod"

export enum EncryptionAlgorithm {
	AES256GCM = "AES256-GCM",
	XChaCha20Poly1305 = "XChaCha20-Poly1305",
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

export const EncryptedData: z.ZodType<EncryptedData> = z.strictInterface({
	algorithm: z.enum(EncryptionAlgorithm),
	iv: z.string(),
	salt: z.string(),
	data: z.string(),
})
