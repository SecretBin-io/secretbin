export interface Event {
	/**
	 * Event ID
	 */
	id: string

	/**
	 * Timestamp of the event
	 */
	timestamp: Date

	/**
	 * Event type
	 */
	type: EventType

	/**
	 * ID of the secret this event is related to
	 */
	secretId: string
}

export enum EventType {
	Created = "created",
	Read = "read",
	Deleted = "deleted",
	Expired = "expired",
	Burned = "burned",
}
