import { combineBaseKeyWithPassword, decrypt, encrypt, EncryptionAlgorithm, randomBytes } from "@nihility-io/crypto"
import { decodeBase58, encodeBase58 } from "@std/encoding/base58"
import { decodeBase64 } from "@std/encoding/base64"
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

/**
 * Encrypt the secret client-side and sends the encrypted secret to the backend for storage
 * @param message Plain message
 * @param files Attached files
 * @param password Encryption password (can be empty)
 * @param options Additional secret objects. See {@link SecretOptions}
 * @param algorithm Specify the algorithm which should be used
 * @returns Secret URL
 */
export async function submitSecret(
	message: string,
	files: File[],
	password: string,
	options: SecretOptions,
	algorithm: EncryptionAlgorithm,
): Promise<string> {
	const baseKey = randomBytes(32)
	const passphrase = combineBaseKeyWithPassword(baseKey, password)

	const attachments = await Promise.all(files.map(fileToAttachment))
	const content: SecretContent = { message, attachments }

	const [data, dataBytes] = await encrypt(passphrase, CBOR.encode(content), algorithm)

	try {
		const id = await createSecret({
			data,
			dataBytes,
			expires: options.expires,
			burnAfter: !options.burn ? -1 : options.slowBurn ? options.rereads : 1,
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

	const { message, attachments }: SecretContent = secret.dataBytes
		? await decrypt(passphrase, secret.data, secret.dataBytes)
			.then((x) => SecretContent.parse(CBOR.decode(x)))
		: await decrypt(passphrase, secret.data)
			.then((x) => SecretContent.parse(JSON.parse(x)))

	return [message, attachments?.map(attachmentToFile) ?? []]
}

/**
 * Creates a File object from a SecretAttachment
 * @param attachment Attachment to convert
 * @returns File object
 */
function attachmentToFile(attachment: SecretAttachment): File {
	const data = typeof attachment.data !== "string" ? attachment.data : decodeBase64(attachment.data)
	return new File([
		new Blob([data], {
			type: attachment.contentType,
		}),
	], attachment.name)
}

/**
 * Creates a SecretAttachment from a File object
 * @param file File to convert
 * @returns SecretAttachment object
 */
async function fileToAttachment(file: File): Promise<SecretAttachment> {
	const data = await file.arrayBuffer()
		.then((buf) => new Uint8Array(buf))

	return { name: file.name, contentType: file.type, data }
}
