import { Event, EventType } from "models"
import postgres from "postgres"
import { logDB } from "server/log"
import { EventListError, LocalizedError } from "utils/errors"

interface Row {
	id: string
	timestamp: Date
	type: EventType
	// deno-lint-ignore camelcase
	secret_id: string
}

export class Events {
	#sql: postgres.Sql

	constructor(sql: postgres.Sql) {
		this.#sql = sql
	}

	/**
	 * Initializes the events table
	 */
	async init(): Promise<void> {
		await this.#sql /*sql*/`
			create table if not exists events (
				id                  uuid       not null primary key,
				timestamp		   timestamp   not null default now(),
				type			   text        not null,
				secret_id          uuid        not null
			)
		`
	}

	/**
	 * Event from a Postgres row
	 * @param r Postgres row
	 * @returns Converted event
	 */
	#fromRow(r: Row): Event {
		return { id: r.id, timestamp: r.timestamp, type: r.type, secretId: r.secret_id }
	}

	/**
	 * Writes an event to the database
	 * @param secretId Secret ID
	 * @param type Event type
	 */
	async emit(secretId: string, type: EventType): Promise<void> {
		try {
			await this.#sql /*sql*/`
				insert into events (
					id,
					type,
					secret_id
				) values (
					${crypto.randomUUID()},
					${type},
					${secretId}
				)
			`
		} catch (err) {
			logDB.error(`Failed to emit event.`, { error: err })
		}
	}

	/**
	 * Creates an iterator which goes over all stored events
	 */
	async *getAll(): AsyncGenerator<Event> {
		try {
			const res = await this.#sql /*sql*/`
				select
					id, timestamp, type, secret_id
				from events
				order by timestamp desc
			`

			for (const e of res.values()) {
				yield this.#fromRow(e as Row)
			}
		} catch (err) {
			logDB.error(`Failed to list events.`, { error: err })
			throw err instanceof LocalizedError ? err : new EventListError()
		}
	}

	/**
	 * Creates an iterator which goes over all stored events for the specified secret
	 * @param secretId Secret ID
	 */
	async *getForSecret(secretId: string): AsyncGenerator<Event> {
		try {
			const res = await this.#sql /*sql*/`
				select
                    id, timestamp, type, secret_id
                from events
                where secret_id = ${secretId}
                order by timestamp desc
			`

			for (const e of res.values()) {
				yield this.#fromRow(e as Row)
			}
		} catch (err) {
			logDB.error(`Failed to list events.`, { error: err })
			throw err instanceof LocalizedError ? err : new EventListError()
		}
	}
}
