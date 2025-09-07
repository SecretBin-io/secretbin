import { combineBaseKeyWithPassword, decrypt, encrypt, EncryptionAlgorithm, randomBytes } from "@nihility-io/crypto"
import { decodeBase58, encodeBase58 } from "@std/encoding/base58"
import { decodeBase64, encodeBase64 } from "@std/encoding/base64"
import * as CBOR from "cbor2"
import { Secret, SecretAttachment, SecretContent } from "models"
import { createSecret } from "./api.ts"

export interface SecretOptions {
	/**
	 * Predefined duration after which a secret should be deleted.
	 */
	expires: string

	/**
	 * If burn is enabled, the secret will be deleted after it's opened.
	 */
	burn: boolean

	/**
	 * If slow burn is enabled, the secret can be read n times before being deleted.
	 */
	slowBurn: boolean

	/**
	 * Number of time a slow burning secret can be read.
	 */
	rereads: number
}

const useCBOR = true

/**
 * Encrypt the secret client-side and sends the encrypted secret to the backend for storage
 * @param message Plain message
 * @param files Attached files
 * @param password Encryption password (can be empty)
 * @param opts Additional secret objects. See {@link SecretOptions}
 * @param algorithm Specify the algorithm which should be used
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
			data: await (useCBOR ? x.bytes() : x.bytes().then(encodeBase64)),
		} satisfies SecretAttachment))),
	} satisfies SecretContent

	const enc =
		await (useCBOR
			? encrypt(passphrase, CBOR.encode(content), algorithm) as Promise<[string, Uint8Array]>
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
 * @param password Encryption password (can be empty)
 * @returns Decrypted Secret
 */
export async function decryptSecret(secret: Secret, password: string): Promise<[string, File[]]> {
	const baseKey = decodeBase58(globalThis.location.hash.slice(1))
	const passphrase = combineBaseKeyWithPassword(baseKey, password)

	let data: SecretContent

	if (secret.dataBytes) {
		const msg = await decrypt(passphrase, secret.data, secret.dataBytes!)
		data = SecretContent.parse(CBOR.decode(msg)) as SecretContent
	} else {
		const msg = await decrypt(passphrase, secret.data)
		data = SecretContent.parse(JSON.parse(msg)) as SecretContent
	}

	return [
		data.message,
		data.attachments?.map((x) =>
			new File([
				new Blob([typeof x.data !== "string" ? x.data : decodeBase64(x.data)], {
					type: x.contentType,
				}),
			], x.name)
		) ?? [],
	]
}
