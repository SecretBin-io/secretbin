import { combineBaseKeyWithPassword, decrypt, encrypt, EncryptionAlgorithm, randomBytes } from "@nihility-io/crypto"
import { decodeBase58, encodeBase58 } from "@std/encoding/base58"
import { encodeBase64 } from "@std/encoding/base64"
import { Secret, SecretAttachment, SecretData } from "models"
import { createSecret } from "./api.ts"

export interface SecretOptions {
	expires: string
	burn: boolean
	slowBurn: boolean
	rereads: number
}

/**
 * Encrypt the secret client-side and sends the encrypted secret to the backend for storage
 * @param message Plain message
 * @param files Attached files
 * @param password Encryption password (can be empty)
 * @param opts Additional secret objects. See {@link SecretOptions}
 * @returns Secret URL
 */
export async function submitSecret(
	message: string,
	files: File[],
	password: string,
	opts: SecretOptions,
	algorithm: EncryptionAlgorithm,
): Promise<string> {
	const baseKey = randomBytes(32)

	const passphrase = combineBaseKeyWithPassword(baseKey, password)
	const content = {
		message,
		attachments: await Promise.all(files.map(async (x) => ({
			name: x.name,
			contentType: x.type,
			data: await x.arrayBuffer().then((x) => new Uint8Array(x)).then(encodeBase64),
		} satisfies SecretAttachment))),
	} satisfies SecretData

	const enc = await encrypt(passphrase, JSON.stringify(content), algorithm)

	try {
		const id = await createSecret({
			data: enc,
			expires: opts.expires,
			burnAfter: !opts.burn ? -1 : opts.slowBurn ? opts.rereads : 1,
			passwordProtected: password !== "",
		})
		return `/secret/${id}/share#${encodeBase58(baseKey)}`
	} catch (err) {
		throw err
	}
}

/**
 * Decrypts the given secret
 * @param secret Encrypted secret
 * @param password  Encryption password (can be empty)
 * @returns Decrypted Secret
 */
export async function decryptSecret(secret: Secret, password: string): Promise<SecretData> {
	const baseKey = decodeBase58(globalThis.location.hash.slice(1))
	const passphrase = combineBaseKeyWithPassword(baseKey, password)
	const msg = await decrypt(passphrase, secret.data)
	return SecretData.parse(JSON.parse(msg)) as SecretData
}
