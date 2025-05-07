/**
 * This file defines all the models used by SecretBin. Models are validated using Zod
 */

import { z } from "zod"
import { EncryptedData } from "./crypto.ts"

export interface NewSecret {
	data: EncryptedData
	expires: string
	burnAfter: number
	passwordProtected: boolean
}

export const NewSecret = z.strictInterface({
	data: EncryptedData,
	expires: z.string().regex(/^(\d+)(min|hr|d|w|m)$/),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
})

export interface SecretMutableMetadata {
	expires: Date
	remainingReads: number
}

export const SecretMutableMetadata = z.strictInterface({
	expires: z.string().or(z.date()).transform((str) => new Date(str)),
	remainingReads: z.number(),
})

export interface SecretMetadata extends SecretMutableMetadata {
	id: string
	passwordProtected: boolean
}

export const SecretMetadata = z.extend(
	SecretMutableMetadata,
	z.strictInterface({
		id: z.string(),
		passwordProtected: z.boolean().default(false),
	}),
).strict()

export interface Secret extends SecretMetadata {
	data: EncryptedData
}

export const Secret = z.extend(
	SecretMetadata,
	z.strictInterface({
		data: EncryptedData,
	}),
).strict()

export interface SecretAttachment {
	name: string
	contentType: string
	data: string
}

export const SecretAttachment = z.strictInterface({
	name: z.string(),
	contentType: z.string(),
	data: z.string(),
})

export interface SecretData {
	message: string
	attachments: SecretAttachment[]
}

export const SecretData = z.strictInterface({
	message: z.string(),
	attachments: z.array(SecretAttachment),
})
