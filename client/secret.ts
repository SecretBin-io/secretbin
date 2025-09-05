import { combineBaseKeyWithPassword, decrypt, encrypt, EncryptionAlgorithm, randomBytes } from "@nihility-io/crypto"
import { decodeBase58, encodeBase58 } from "@std/encoding/base58"
import { decodeBase64, encodeBase64 } from "@std/encoding/base64"
import * as MsgPack from "@std/msgpack"
import { Secret, SecretAttachment, SecretData } from "models"
import { createSecret } from "./api.ts"

export interface SecretOptions {
	expires: string
	burn: boolean
	slowBurn: boolean
	rereads: number
}

const useMsgPack = true

export interface SecretContent {
	message: string
	files?: File[]
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
			data: await (useMsgPack ? x.bytes() : x.bytes().then(encodeBase64)),
		} satisfies SecretAttachment))),
	} satisfies SecretData

	const enc =
		await (useMsgPack
			? encrypt(passphrase, MsgPack.encode(content), algorithm) as Promise<[string, Uint8Array]>
			: encrypt(passphrase, JSON.stringify(content), algorithm) as Promise<string>)

	try {
		const id = await createSecret({
			data: typeof enc !== "string" ? enc[0] : enc,
			dataBytes: typeof enc !== "string" ? enc[1] : undefined,
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
export async function decryptSecret(secret: Secret, password: string): Promise<SecretContent> {
	const baseKey = decodeBase58(globalThis.location.hash.slice(1))
	const passphrase = combineBaseKeyWithPassword(baseKey, password)

	let data: SecretData

	if (secret.dataBytes) {
		const msg = await decrypt(passphrase, secret.data, secret.dataBytes!)
		data = SecretData.parse(MsgPack.decode(msg)) as SecretData
	} else {
		const msg = await decrypt(passphrase, secret.data)
		data = SecretData.parse(JSON.parse(msg)) as SecretData
	}

	return {
		message: data.message,
		files: data.attachments?.map((x) =>
			new File([
				new Blob([typeof x.data !== "string" ? x.data : decodeBase64(x.data)], {
					type: x.contentType,
				}),
			], x.name)
		),
	}
}
