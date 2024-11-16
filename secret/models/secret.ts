/**
 * This file defines all the models used by SecretBin. Models are validated using Zod
 */

import { EncryptedData, EncryptionAlgorithm } from "./crypto.ts"
import { z } from "zod"

const EncryptedDataModel = z.object({
	data: z.string(),
	iv: z.string(),
	salt: z.string(),
	algorithm: z.nativeEnum(EncryptionAlgorithm),
}).strict()

export interface NewSecret {
	data: EncryptedData
	expires: string
	burnAfter: number
	passwordProtected: boolean
}

export const NewSecret = z.object({
	data: EncryptedDataModel,
	expires: z.string().regex(/^(\d+)(min|hr|d|w|m)$/),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
}).strict()
export interface SecretMetadata {
	id: string
	expires: Date
	remainingReads: number
	passwordProtected: boolean
}

export const SecretMetadata = z.object({
	id: z.string(),
	expires: z.string().or(z.date()).transform((str) => new Date(str)),
	remainingReads: z.number(),
	passwordProtected: z.boolean().default(false),
}).strict()

export interface Secret extends SecretMetadata {
	data: EncryptedData
}

export const Secret = SecretMetadata.extend({
	data: EncryptedDataModel,
}).strict()

export interface SecretAttachment {
	name: string
	contentType: string
	data: string
}

export const SecretAttachment = z.object({
	name: z.string(),
	contentType: z.string(),
	data: z.string(),
}).strict()

export interface SecretData {
	message: string
	attachments: SecretAttachment[]
}

export const SecretData = z.object({
	message: z.string(),
	attachments: z.array(SecretAttachment),
}).strict()
