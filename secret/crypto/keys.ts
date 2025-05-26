import { scryptAsync } from "@noble/hashes/scrypt"
import {
	CryptoKeyParams,
	KeyAlgorithm,
	toBytes,
	UnexpectedKeyAlgorithmError,
	UnsupportedKeyAlgorithmError,
} from "secret/crypto"

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
 * @param salt Random salt
 * @param algorithm Encryption algorithm
 * @returns Derived key
 */
export function deriveKey(
	key: Uint8Array,
	salt: Uint8Array,
	params: CryptoKeyParams,
): Promise<[key: (CryptoKey | Uint8Array), params: CryptoKeyParams]> {
	const algo = params["key-algo"] as KeyAlgorithm | null
	if (algo === null) throw new Error("missing key-algo in encrypted data")

	switch (algo) {
		case KeyAlgorithm.PBKDF2:
			return deriveKeyPBKDF2(key, salt, params)
		case KeyAlgorithm.Scrypto:
			return deriveKeyScrypto(key, salt, params)
		default:
			throw new UnsupportedKeyAlgorithmError(algo)
	}
}

/**
 * Generates a new encryption key using PBKDF2 based on a random encryption key
 * @param key Random encryption key
 * @param salt Random salt
 * @param algorithm Encryption algorithm
 * @returns Derived key
 */
async function deriveKeyPBKDF2(
	key: Uint8Array,
	salt: Uint8Array,
	params: CryptoKeyParams,
): Promise<[key: CryptoKey, params: CryptoKeyParams]> {
	if (params["key-algo"] !== KeyAlgorithm.PBKDF2) {
		throw new UnexpectedKeyAlgorithmError(params["key-algo"], KeyAlgorithm.PBKDF2)
	}

	const iter = params["iter"] ?? "100000"
	const hash = params["hash"] ?? "SHA-256"

	// Import raw key
	const importedKey = await globalThis.crypto.subtle.importKey(
		"raw", // Only 'raw' is allowed
		key, // Encryption key
		{ name: "PBKDF2" }, // Use PBKDF2 for key derivation
		false, // The key may not be exported
		["deriveKey"], // We may only use it for key derivation
	)

	// derive a stronger key for use with AES
	return [
		await globalThis.crypto.subtle.deriveKey(
			{
				name: "PBKDF2",
				salt,
				iterations: +iter,
				hash: { name: hash },
			}, // Key algorithm
			importedKey,
			{
				name: "AES-GCM",
				length: 256,
			}, // Set what the key is intended to be used for
			true, // The key may be exported
			["encrypt", "decrypt"], // We may only use it for en- and decryption
		),
		{ "key-algo": KeyAlgorithm.PBKDF2, iter, hash },
	]
}

/**
 * Generates a new encryption key using Scrypto based on a random encryption key
 * @param key Random encryption key
 * @param salt Random salt
 * @param algorithm Encryption algorithm
 * @returns Derived key
 */
async function deriveKeyScrypto(
	key: Uint8Array,
	salt: Uint8Array,
	params: CryptoKeyParams,
): Promise<[key: Uint8Array, params: CryptoKeyParams]> {
	if (params["key-algo"] !== KeyAlgorithm.Scrypto) {
		throw new UnexpectedKeyAlgorithmError(params["key-algo"], KeyAlgorithm.Scrypto)
	}

	const n = params["n"] ?? `${2 ** 16}`
	const p = params["p"] ?? "8"
	const r = params["r"] ?? "1"
	return [
		await scryptAsync(key, salt, {
			N: +n, // Cost factor
			r: +r, // Block size
			p: +p, // Parallelization
			dkLen: 32, // Key length
		}),
		{ "key-algo": KeyAlgorithm.Scrypto, n, r, p },
	]
}
