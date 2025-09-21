import { Event, EventType, Secret, SecretMetadata } from "models"

export interface EventRow {
	id: string
	timestamp: Date
	type: EventType
	// deno-lint-ignore camelcase
	secret_id: string
}

export interface SecretRow {
	id: string
	// deno-lint-ignore camelcase
	created_at: Date
	expires: Date
	// deno-lint-ignore camelcase
	remaining_reads: number
	// deno-lint-ignore camelcase
	password_protected: boolean
	data: string
	// deno-lint-ignore camelcase
	data_bytes: Uint8Array | null
}

/**
 * Creates a secret metadata object from a Postgres row
 * @param r Postgres row
 * @returns Secret
 */
export function metadataFromRow(r: SecretRow): SecretMetadata {
	return {
		id: r.id,
		expires: r.expires,
		remainingReads: r.remaining_reads,
		passwordProtected: r.password_protected,
	}
}

/**
 * Creates a secret object from a Postgres row
 * @param r Postgres row
 * @returns Secret
 */
export async function secretFromRow(r: SecretRow): Promise<Secret> {
	try {
		const metadata = await metadataFromRow(r)
		return {
			...metadata,
			data: r.data,
			dataBytes: r.data_bytes ? r.data_bytes : undefined,
		} satisfies Secret
	} catch (err) {
		throw err
	}
}

/**
 * Event from a Postgres row
 * @param r Postgres row
 * @returns Converted event
 */
export function eventFromRow(r: EventRow): Event {
	return {
		id: r.id,
		timestamp: r.timestamp,
		type: r.type,
		secretId: r.secret_id,
	}
}
