import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import {
	CryptoURL,
	DecryptionError,
	deriveKey,
	EncryptionAlgorithm,
	fromBytes,
	UnsupportedEncryptionAlgorithmError,
} from "secret/crypto"

/**
 * Decrypts the encrypted data using the given key and password
 * @param key Random encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param cryptoURL Encrypted data and encryption parameters in the form of a CryptoURL
 * @returns Decrypted data string
 */
export async function decrypt(key: Uint8Array, password: string, cryptoURL: string): Promise<string> {
	const c = new CryptoURL(cryptoURL)

	switch (c.algorithm) {
		case EncryptionAlgorithm.AES256GCM:
			return fromBytes(await decryptAES256GCM(key, password, c))
		case EncryptionAlgorithm.XChaCha20Poly1305:
			return fromBytes(await decryptXChaCha20Poly1305(key, password, c))
		default:
			throw new UnsupportedEncryptionAlgorithmError(c.algorithm)
	}
}

/**
 * Decrypts the encrypted data with the given key and optional password using AES256-GCM
 * @param key Encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param cryptoURL Encrypted data and encryption parameters in the form of a CryptoURL
 * @returns Decrypted data string
 */
async function decryptAES256GCM(key: Uint8Array, password: string, cryptoURL: CryptoURL): Promise<Uint8Array> {
	const iv = cryptoURL.getBase58("nonce")
	const k = await deriveKey(key, password, cryptoURL)

	try {
		const gcmParams = { name: "AES-GCM", iv: iv, additionalData: new Uint8Array() } satisfies AesGcmParams
		return new Uint8Array(await globalThis.crypto.subtle.decrypt(gcmParams, k as CryptoKey, cryptoURL.data))
	} catch (error) {
		throw new DecryptionError(error instanceof Error ? error.message : String(error))
	}
}

/**
 * Decrypts the encrypted data with the given key and optional password using XChaCha20-Poly1305
 * @param key Encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param cryptoURL Encrypted data and encryption parameters in the form of a CryptoURL
 * @returns Decrypted data string
 */
async function decryptXChaCha20Poly1305(key: Uint8Array, password: string, cryptoURL: CryptoURL): Promise<Uint8Array> {
	const iv = cryptoURL.getBase58("nonce")
	const k = await deriveKey(key, password, cryptoURL)

	try {
		return xchacha20poly1305(k as Uint8Array, iv).decrypt(cryptoURL.data)
	} catch (error) {
		throw new DecryptionError(error instanceof Error ? error.message : String(error))
	}
}
