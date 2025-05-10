import { decodeBase58, encodeBase58 } from "@std/encoding/base58"
import { encodeBase64 } from "@std/encoding/base64"
import { Secret, SecretAttachment, SecretData } from "secret/models"
import { createSecret } from "./api.ts"
import { decrypt, encrypt, randomBytes } from "./crypto.ts"

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
export const submitSecret = async (message: string, files: File[], password: string, opts: SecretOptions) => {
	const masterKey = randomBytes(32)
	const content = {
		message,
		attachments: await Promise.all(files.map(async (x) => ({
			name: x.name,
			contentType: x.type,
			data: await x.arrayBuffer().then((x) => new Uint8Array(x)).then(encodeBase64),
		} satisfies SecretAttachment))),
	} satisfies SecretData

	const enc = await encrypt(
		masterKey,
		password,
		JSON.stringify(content),
	)

	try {
		const id = await createSecret({
			data: enc,
			expires: opts.expires,
			burnAfter: !opts.burn ? -1 : opts.slowBurn ? opts.rereads : 1,
			passwordProtected: password !== "",
		})
		return `/secret/${id}/share#${encodeBase58(masterKey)}`
	} catch (e) {
		throw e
	}
}

/**
 * Decrypts the given secret
 * @param secret Encrypted secret
 * @param password  Encryption password (can be empty)
 * @returns Decrypted Secret
 */
export const decryptSecret = async (secret: Secret, password: string): Promise<SecretData> => {
	const masterKey = decodeBase58(globalThis.location.hash.slice(1))
	const msg = await decrypt(masterKey, password, {
		data: secret.data.data,
		iv: secret.data.iv,
		salt: secret.data.salt,
		algorithm: secret.data.algorithm,
	})
	return SecretData.parse(JSON.parse(msg)) as SecretData
}
