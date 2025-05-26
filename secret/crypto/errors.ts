import { EncryptionAlgorithm, KeyAlgorithm } from "secret/crypto"

export class UnsupportedKeyAlgorithmError extends Error {
	constructor(algorithm: KeyAlgorithm) {
		super(`Unsupported key algorithm: ${algorithm}`)
		this.name = "UnsupportedKeyAlgorithmError"
	}
}

export class UnexpectedKeyAlgorithmError extends Error {
	constructor(algorithm: KeyAlgorithm, expected: KeyAlgorithm) {
		super(`Unexpected key algorithm: expected ${expected} but got ${algorithm}`)
		this.name = "UnexpectedKeyAlgorithmError"
	}
}
export class UnsupportedEncryptionAlgorithmError extends Error {
	constructor(algorithm: EncryptionAlgorithm) {
		super(`Unsupported encryption algorithm: ${algorithm}`)
		this.name = "UnsupportedEncryptionAlgorithmError"
	}
}

export class UnexpectedEncryptionAlgorithmError extends Error {
	constructor(algorithm: EncryptionAlgorithm, expected: EncryptionAlgorithm) {
		super(`Unexpected encryption algorithm: expected ${expected} but got ${algorithm}`)
		this.name = "UnexpectedEncryptionAlgorithmError"
	}
}

export class InvalidEncryptionParameterError extends Error {
	constructor(parameter: string, value?: string) {
		super(`Invalid value for ${parameter} parameter: ${value ?? "<missing>"}`)
		this.name = "InvalidEncryptionParameterError"
	}
}

export class EncryptionError extends Error {
	constructor(message: string) {
		super(`Internal encryption error: ${message}`)
		this.name = "EncryptionError"
	}
}

export class DecryptionError extends Error {
	constructor(message: string) {
		super(`Internal decryption error: ${message}`)
		this.name = "DecryptionError"
	}
}
