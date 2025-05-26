import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import {
	deriveKey,
	EncryptionAlgorithm,
	EncryptionError,
	KeyAlgorithm,
	randomBytes,
	toBytes,
	UnsupportedEncryptionAlgorithmError,
} from "secret/crypto"
import { CryptoURL } from "./parameters.ts"

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
	switch (algorithm) {
		case EncryptionAlgorithm.AES256GCM:
			return encryptAES256GCM(key, password, data)
		case EncryptionAlgorithm.XChaCha20Poly1305:
			return encryptXChaCha20Poly1305(key, password, data)
		default:
			throw new UnsupportedEncryptionAlgorithmError(algorithm)
	}
}

/**
 * Encrypts the data with the given key and optional password using AES256-GCM
 * @param key Random encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param data Data to encrypt
 * @returns Encrypted data
 */
async function encryptAES256GCM(key: Uint8Array, password: string, data: Uint8Array): Promise<string> {
	const cryptoURL = new CryptoURL(EncryptionAlgorithm.AES256GCM, KeyAlgorithm.PBKDF2)
	const iv = cryptoURL.setBase58("nonce", randomBytes(12))
	const k = await deriveKey(key, password, cryptoURL)

	try {
		const gcmParams = { name: "AES-GCM", iv: iv, additionalData: new Uint8Array() } satisfies AesGcmParams
		cryptoURL.data = new Uint8Array(await globalThis.crypto.subtle.encrypt(gcmParams, k as CryptoKey, data))
		return cryptoURL.toString()
	} catch (error) {
		throw new EncryptionError(error instanceof Error ? error.message : String(error))
	}
}

/**
 * Encrypts the data with the given key and optional password using XChaCha20-Poly1305
 * @param key Random encryption key
 * @param password Optional encryption password which can be using in addition to the key
 * @param data Data to encrypt
 * @returns Encrypted data
 */
async function encryptXChaCha20Poly1305(key: Uint8Array, password: string, data: Uint8Array): Promise<string> {
	const cryptoURL = new CryptoURL(EncryptionAlgorithm.XChaCha20Poly1305, KeyAlgorithm.Scrypto)
	const nonce = cryptoURL.setBase58("nonce", randomBytes(xchacha20poly1305.nonceLength))
	const k = await deriveKey(key, password, cryptoURL)

	try {
		cryptoURL.data = xchacha20poly1305(k as Uint8Array, nonce).encrypt(data)
		return cryptoURL.toString()
	} catch (error) {
		throw new EncryptionError(error instanceof Error ? error.message : String(error))
	}
}
