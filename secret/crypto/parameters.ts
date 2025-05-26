import { decodeBase58 } from "@std/encoding/base58"
import { decodeBase64, encodeBase64 } from "@std/encoding/base64"
import { InvalidEncryptionParameterError } from "secret/crypto"

export enum EncryptionAlgorithm {
	AES256GCM = "AES256-GCM",
	XChaCha20Poly1305 = "XChaCha20Poly1305",
}

export enum KeyAlgorithm {
	PBKDF2 = "pbkdf2",
	Scrypto = "scrypto",
}

export interface CryptoKeyParams extends Record<string, string> {
	"key-algo": KeyAlgorithm
}

export interface CryptoParams extends CryptoKeyParams {
	"algo": EncryptionAlgorithm
}

export type CryptoURL = string

/**
 * Encodes the encryption parameters and data into a crypto URL format.
 * @param params Encryption parameters
 * @param data Encrypted data
 * @returns CryptoURL
 */
export function encodeCryptoURL(params: CryptoParams, data: Uint8Array): CryptoURL {
	const urlParams = new URLSearchParams(params)
	const encodedData = encodeBase64(data)
	return new URL(`crypto://?${urlParams.toString()}`).toString() + ":::" + encodedData
}

/**
 * Decodes a crypto URL into the encryption parameters and the encrypted data.
 * @param url Crypto URL to decode
 * @returns Encryption parameters and encrypted data
 */
export function decodeCryptoURL(url: CryptoURL): [params: CryptoParams, data: Uint8Array] {
	const [rawParams, encodedData] = url.split(":::")
	if (!rawParams || !encodedData) {
		throw new Error("invalid crypto URL format")
	}

	const paramURL = new URL(rawParams)
	if (paramURL.protocol !== "crypto:") {
		throw new Error("invalid crypto URL protocol")
	}

	const params = {} as CryptoParams
	for (const [key, value] of paramURL.searchParams.entries()) {
		params[key] = value
	}

	const data = decodeBase64(encodedData)
	return [params, data]
}

/**
 * Gets a base58 encoded parameter from the encryption parameters.
 * @param params Encryption parameters
 * @param key Parameter key
 * @returns Parameter data
 * @throws {InvalidEncryptionParameterError} If the parameter is missing or invalid
 */
export function getBase58Parameter(params: CryptoParams, key: string): Uint8Array {
	try {
		if (params[key] === null) {
			throw new InvalidEncryptionParameterError(key, params[key])
		}
		return decodeBase58(params[key])
	} catch {
		throw new InvalidEncryptionParameterError(key, params[key])
	}
}
