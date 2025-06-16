/**
 * This file defines all the models used by SecretBin. Models are validated using Zod
 */

import z, { ZodObject, ZodType } from "zod"

export const EncryptionString = z.string().startsWith("crypto://")

export interface SecretRequest {
	expires: string
	burnAfter: number
	passwordProtected: boolean
	data: string
}

export const SecretRequest: ZodType<SecretRequest> = z.strictObject({
	expires: z.string().check(z.regex(/^(\d+)(min|hr|d|w|m)$/)),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
	data: EncryptionString,
})

export interface SecretMutableMetadata {
	expires: Date
	remainingReads: number
}

export const SecretMutableMetadata: ZodType<SecretMutableMetadata> = z.strictObject({
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

export const SecretMetadata: ZodType<SecretMetadata> = (SecretMutableMetadata as unknown as ZodObject).extend({
	id: z.string(),
	passwordProtected: z.boolean().default(false),
}) as unknown as ZodType<SecretMetadata>

export interface Secret extends SecretMetadata {
	data: string
}

export const Secret: ZodType<Secret> = (SecretMetadata as unknown as ZodObject).extend({
	data: EncryptionString,
}) as unknown as ZodType<Secret>

export interface SecretAttachment {
	name: string
	contentType: string
	data: string
}

export const SecretAttachment: ZodType<SecretAttachment> = z.strictObject({
	name: z.string(),
	contentType: z.string(),
	data: z.string(),
})

export interface SecretData {
	message: string
	attachments: SecretAttachment[]
}

export const SecretData: ZodType<SecretData> = z.strictObject({
	message: z.string(),
	attachments: z.array(SecretAttachment),
})
