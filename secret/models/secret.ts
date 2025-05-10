/**
 * This file defines all the models used by SecretBin. Models are validated using Zod
 */

import z, { ZodInterface, ZodType } from "zod"
import { EncryptedData } from "./crypto.ts"

export interface SecretRequest {
	expires: string
	burnAfter: number
	passwordProtected: boolean
	data: EncryptedData
}

export const SecretRequest: ZodType<SecretRequest> = z.strictInterface({
	expires: z.string().check(z.regex(/^(\d+)(min|hr|d|w|m)$/)),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
	data: EncryptedData,
})

export interface SecretMutableMetadata {
	expires: Date
	remainingReads: number
}

export const SecretMutableMetadata: ZodType<SecretMutableMetadata> = z.strictInterface({
	expires: z.union([
		z.string().transform((str) => new Date(str)),
		z.date(),
	]),
	remainingReads: z.number(),
})

export interface SecretMetadata extends SecretMutableMetadata {
	id: string
	passwordProtected: boolean
}

export const SecretMetadata: ZodType<SecretMetadata> = z.extend(
	SecretMutableMetadata as unknown as ZodInterface,
	z.strictInterface({
		id: z.string(),
		passwordProtected: z.boolean().default(false),
	}),
) as unknown as ZodType<SecretMetadata>

export interface Secret extends SecretMetadata {
	data: EncryptedData
}

export const Secret: ZodType<Secret> = z.extend(
	SecretMetadata as unknown as ZodInterface,
	z.strictInterface({
		data: EncryptedData,
	}),
) as unknown as ZodType<Secret>

export interface SecretAttachment {
	name: string
	contentType: string
	data: string
}

export const SecretAttachment: ZodType<SecretAttachment> = z.strictInterface({
	name: z.string(),
	contentType: z.string(),
	data: z.string(),
})

export interface SecretData {
	message: string
	attachments: SecretAttachment[]
}

export const SecretData: ZodType<SecretData> = z.strictInterface({
	message: z.string(),
	attachments: z.array(SecretAttachment),
})
