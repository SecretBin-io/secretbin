import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import { encodeBase58 } from "@std/encoding/base58"
import {
	combineKeyWithPassword,
	deriveKey,
	encodeCryptoURL,
	EncryptionAlgorithm,
	EncryptionError,
	KeyAlgorithm,
	randomBytes,
	toBytes,
	UnsupportedEncryptionAlgorithmError,
} from "secret/crypto"

/**
 * Encrypts the message using the given key and password
 * @param key Random encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param message Message to encrypt
 * @param algorithm Encryption algorithm (default: AES256-GCM)
 * @returns Encrypted data
 */
export function encrypt(
	key: Uint8Array,
	password: string,
	message: string,
	algorithm = EncryptionAlgorithm.AES256GCM,
): Promise<string> {
	const data = toBytes(message)
	const newKey = combineKeyWithPassword(key, password)

	switch (algorithm) {
		case EncryptionAlgorithm.AES256GCM:
			return encryptAES256GCM(newKey, data)
		case EncryptionAlgorithm.XChaCha20Poly1305:
			return encryptXChaCha20Poly1305(newKey, data)
		default:
			throw new UnsupportedEncryptionAlgorithmError(algorithm)
	}
}

/**
 * Encrypts the data with the given key using AES256-GCM
 * @param key Random encryption key
 * @param data Data to encrypt
 * @returns Encrypted data
 */
async function encryptAES256GCM(key: Uint8Array, data: Uint8Array): Promise<string> {
	const iv = randomBytes(12)
	const salt = randomBytes(8)
	const [k, keyParams] = await deriveKey(key, salt, { "key-algo": KeyAlgorithm.PBKDF2 })

	try {
		const gcmParams = { name: "AES-GCM", iv: iv, additionalData: new Uint8Array() } satisfies AesGcmParams
		const encrypted = new Uint8Array(await globalThis.crypto.subtle.encrypt(gcmParams, k as CryptoKey, data))

		return encodeCryptoURL({
			algo: EncryptionAlgorithm.AES256GCM,
			nonce: encodeBase58(iv),
			salt: encodeBase58(salt),
			...keyParams,
		}, encrypted)
	} catch (error) {
		throw new EncryptionError(error instanceof Error ? error.message : String(error))
	}
}

/**
 * Encrypts the data with the given key using XChaCha20-Poly1305
 * @param key Random encryption key
 * @param data Data to encrypt
 * @returns Encrypted data
 */
async function encryptXChaCha20Poly1305(key: Uint8Array, data: Uint8Array): Promise<string> {
	const iv = randomBytes(xchacha20poly1305.nonceLength)
	const salt = randomBytes(8)
	const [k, keyParams] = await deriveKey(key, salt, { "key-algo": KeyAlgorithm.Scrypto })

	try {
		const encrypted = xchacha20poly1305(k as Uint8Array, iv).encrypt(data)

		return encodeCryptoURL({
			algo: EncryptionAlgorithm.XChaCha20Poly1305,
			nonce: encodeBase58(iv),
			salt: encodeBase58(salt),
			...keyParams,
		}, encrypted)
	} catch (error) {
		throw new EncryptionError(error instanceof Error ? error.message : String(error))
	}
}
