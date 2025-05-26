import { scryptAsync } from "@noble/hashes/scrypt"
import { CryptoURL, KeyAlgorithm, randomBytes, toBytes, UnsupportedKeyAlgorithmError } from "secret/crypto"

/**
 * Combines a random encryption key with an optional password to create a new key
 * @param key Random encryption key
 * @param password Optional password to combine with the key
 * @returns New key
 */
export function combineKeyWithPassword(key: Uint8Array, password: string): Uint8Array {
	if (!password || password.length === 0) {
		return key // No password, return the key as is
	}

	// If password is set, append it to the key
	const pwData = toBytes(password)
	const newKeyArray = new Uint8Array(key.length + password.length)
	newKeyArray.set(key, 0)
	newKeyArray.set(pwData, key.length)
	return newKeyArray
}

/**
 * Generates a new encryption key based on a random encryption key and an optional password
 * @param key Random encryption key
 * @param password Optional password to combine with the key
 * @param cryptoURL Crypto parameters containing the key algorithm and other settings
 * @returns Derived key
 */
export function deriveKey(key: Uint8Array, password: string, cryptoURL: CryptoURL): Promise<CryptoKey | Uint8Array> {
	const k = combineKeyWithPassword(key, password)
	switch (cryptoURL.keyAlgorithm) {
		case KeyAlgorithm.PBKDF2:
			return deriveKeyPBKDF2(k, cryptoURL)
		case KeyAlgorithm.Scrypto:
			return deriveKeyScrypto(k, cryptoURL)
		default:
			throw new UnsupportedKeyAlgorithmError(cryptoURL.keyAlgorithm)
	}
}

/**
 * Generates a new encryption key using PBKDF2 based on a random encryption key
 * @param key Random encryption key
 * @param cryptoURL Crypto parameters containing the key algorithm and other settings
 * @returns Derived key
 */
async function deriveKeyPBKDF2(key: Uint8Array, cryptoURL: CryptoURL): Promise<CryptoKey> {
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
			salt: cryptoURL.getBase58("salt", randomBytes(8)),
			iterations: cryptoURL.getNumber("iter", 100000),
			hash: { name: cryptoURL.get("hash", "SHA-256") },
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

/**
 * Generates a new encryption key using Scrypto based on a random encryption key
 * @param key Random encryption key
 * @param cryptoURL Crypto parameters containing the key algorithm and other settings
 * @returns Derived key
 */
function deriveKeyScrypto(key: Uint8Array, cryptoURL: CryptoURL): Promise<Uint8Array> {
	return scryptAsync(key, cryptoURL.getBase58("salt", randomBytes(8)), {
		N: cryptoURL.getNumber("n", 2 ** 16), // Cost factor
		r: cryptoURL.getNumber("r", 1), // Block size
		p: cryptoURL.getNumber("p", 8), // Parallelization
		dkLen: 32, // Key length
	})
}
