import { xchacha20poly1305 } from "@noble/ciphers/chacha"
import { scryptAsync } from "@noble/hashes/scrypt"
import { decodeBase64, encodeBase64 } from "@std/encoding/base64"
import { EncryptedData, EncryptionAlgorithm } from "secret/models"

/**
 * Generates a random Uint8Array with a given length
 * @param length Number of bytes to return
 * @returns A Uint8Array with random bytes
 */
export function randomBytes(length: number): Uint8Array {
	return globalThis.crypto.getRandomValues(new Uint8Array(length))
}

/**
 * Converts a raw string into a bytes
 * @param s String
 * @returns Bytes
 */
export function toBytes(s: string): Uint8Array {
	return new TextEncoder().encode(s)
}

/**
 * Converts bytes into a raw string
 * @param b Bytes
 * @returns String
 */
export function fromBytes(b: Uint8Array): string {
	return new TextDecoder().decode(b)
}

/**
 * Encrypts the message using the given key and password
 * @param key Random encryption key (e.g. 256 bit (32 byte) for AES256-GCM)
 * @param password Optional encryption password which can be using in addition to the key
 * @param message Message to encrypt
 * @param algorithm Encryption algorithm (default: AES256-GCM)
 * @returns Encrypted data
 */
export async function encrypt(
	key: Uint8Array,
	password: string,
	message: string,
	algorithm = EncryptionAlgorithm.AES256GCM,
): Promise<EncryptedData> {
	if (key.length !== 32) {
		throw new Error("invalid key length for AES256-GCM")
	}

	const data = toBytes(message)
	const iv = randomBytes(EncryptionAlgorithm.XChaCha20Poly1305 ? xchacha20poly1305.nonceLength : 12)
	const salt = randomBytes(8)
	const k = await deriveKey(key, password, salt, algorithm)
	const encrypted = algorithm === EncryptionAlgorithm.XChaCha20Poly1305
		? xchacha20poly1305(k as Uint8Array, iv).encrypt(data)
		: new Uint8Array(
			await globalThis.crypto.subtle.encrypt(
				{ name: "AES-GCM", iv: iv, additionalData: new Uint8Array() },
				k as CryptoKey,
				data,
			),
		)

	return {
		data: encodeBase64(encrypted),
		iv: encodeBase64(iv),
		salt: encodeBase64(salt),
		algorithm: algorithm,
	}
}

/**
 * Decrypts the message using the given key and password
 * @param key Random encryption key (e.g. 256 bit (32 byte) for AES256-GCM)
 * @param password Optional encryption password which can be using in addition to the key
 * @param data Encrypted data
 * @returns Decrypted data string
 */
export async function decrypt(key: Uint8Array, password: string, encrypted: EncryptedData): Promise<string> {
	if (key.length !== 32) {
		throw new Error("invalid key length for AES256-GCM")
	}

	const data = decodeBase64(encrypted.data)
	const iv = decodeBase64(encrypted.iv)
	const salt = decodeBase64(encrypted.salt)
	const k = await deriveKey(key, password, salt, encrypted.algorithm)

	const res = encrypted.algorithm === EncryptionAlgorithm.XChaCha20Poly1305
		? xchacha20poly1305(k as Uint8Array, iv).decrypt(data)
		: new Uint8Array(
			await globalThis.crypto.subtle.decrypt(
				{ name: "AES-GCM", iv: iv, additionalData: new Uint8Array() },
				k as CryptoKey,
				data,
			),
		)

	return fromBytes(res)
}

/**
 * Generates a new encryption key based on a random encryption key and an optional password
 * @param key Random encryption key (e.g. 256 bit (32 byte) for AES256-GCM)
 * @param password Optional encryption password which can be using in addition to the key
 * @param salt Random salt
 * @param algorithm Encryption algorithm
 * @returns Derived key
 */
async function deriveKey(
	key: Uint8Array,
	password: string,
	salt: Uint8Array,
	algorithm: EncryptionAlgorithm,
): Promise<CryptoKey | Uint8Array> {
	// If password is set, append it to the key
	const pwData = toBytes(password)
	if (pwData.length > 0) {
		const newKeyArray = new Uint8Array(key.length + password.length)
		newKeyArray.set(key, 0)
		newKeyArray.set(pwData, key.length)
		key = newKeyArray
	}

	if (algorithm === EncryptionAlgorithm.XChaCha20Poly1305) {
		return scryptAsync(key, salt, {
			N: 2 ** 16, // Cost factor
			r: 8, // Block size
			p: 1, // Parallelization
			dkLen: 32, // Key length
		})
	}

	// Import raw key
	const importedKey = await globalThis.crypto.subtle.importKey(
		"raw", // Only 'raw' is allowed
		key, // Encryption key
		{ name: "PBKDF2" }, // Use PBKDF2 for key derivation
		false, // The key may not be exported
		["deriveKey"], // We may only use it for key derivation
	)

	// derive a stronger key for use with AES
	return globalThis.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt,
			iterations: 100000,
			hash: { name: "SHA-256" },
		}, // Key algorithm
		importedKey,
		{
			name: "AES-GCM",
			length: 256,
		}, // Set what the key is intended to be used for
		true, // The key may be exported
		["encrypt", "decrypt"], // We may only use it for en- and decryption
	)
}

export interface PasswordGeneratorOptions {
	useUppercase: boolean
	useLowercase: boolean
	useDigits: boolean
	useSymbols: boolean
	length: number
}

/**
 * Generates a random password at a given length using a given set of characters
 * @param options Specify the password length and characters
 * @returns Random password
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
	const characters = [
		options.useUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
		options.useLowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
		options.useDigits ? "0123456789" : "",
		options.useSymbols ? "~!@#%&*_-+=,.?<>" : "",
	].join("")
	return Array.from(randomBytes(options.length))
		.map((x) => characters[x % characters.length])
		.join("")
}
