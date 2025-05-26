import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import {
	combineKeyWithPassword,
	CryptoParams,
	decodeCryptoURL,
	DecryptionError,
	deriveKey,
	EncryptionAlgorithm,
	fromBytes,
	getBase58Parameter,
	UnexpectedEncryptionAlgorithmError,
	UnsupportedEncryptionAlgorithmError,
} from "secret/crypto"

/**
 * Decrypts the message using the given key and password
 * @param key Random encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param data Encrypted data
 * @returns Decrypted data string
 */
export function decrypt(key: Uint8Array, password: string, encrypted: string): Promise<string> {
	const [params, data] = decodeCryptoURL(encrypted)
	const newKey = combineKeyWithPassword(key, password)

	switch (params.algo) {
		case EncryptionAlgorithm.AES256GCM:
			return decryptAES256GCM(newKey, params, data)
		case EncryptionAlgorithm.XChaCha20Poly1305:
			return decryptXChaCha20Poly1305(newKey, params, data)
		default:
			throw new UnsupportedEncryptionAlgorithmError(params.algo)
	}
}

/**
 * Decrypts the data with the given key using AES256-GCM
 * @param key Encryption key
 * @param params Encryption parameters
 * @param data Encrypted data
 * @returns Decrypted data string
 */
async function decryptAES256GCM(key: Uint8Array, params: CryptoParams, data: Uint8Array): Promise<string> {
	if (params.algo !== EncryptionAlgorithm.AES256GCM) {
		throw new UnexpectedEncryptionAlgorithmError(params.algo, EncryptionAlgorithm.AES256GCM)
	}

	const iv = getBase58Parameter(params, "nonce")
	const salt = getBase58Parameter(params, "salt")

	const [k, _] = await deriveKey(key, salt, params)

	try {
		const gcmParams = { name: "AES-GCM", iv: iv, additionalData: new Uint8Array() } satisfies AesGcmParams
		const res = new Uint8Array(await globalThis.crypto.subtle.decrypt(gcmParams, k as CryptoKey, data))

		return fromBytes(res)
	} catch (error) {
		throw new DecryptionError(error instanceof Error ? error.message : String(error))
	}
}

/**
 * Decrypts the data with the given key using XChaCha20-Poly1305
 * @param key Encryption key
 * @param params Encryption parameters
 * @param data Encrypted data
 * @returns Decrypted data string
 */
async function decryptXChaCha20Poly1305(key: Uint8Array, params: CryptoParams, data: Uint8Array): Promise<string> {
	if (params.algo !== EncryptionAlgorithm.XChaCha20Poly1305) {
		throw new UnexpectedEncryptionAlgorithmError(params.algo, EncryptionAlgorithm.AES256GCM)
	}

	const iv = getBase58Parameter(params, "nonce")
	const salt = getBase58Parameter(params, "salt")

	const [k, _] = await deriveKey(key, salt, params)

	try {
		const res = xchacha20poly1305(k as Uint8Array, iv).decrypt(data)
		return fromBytes(res)
	} catch (error) {
		throw new DecryptionError(error instanceof Error ? error.message : String(error))
	}
}
