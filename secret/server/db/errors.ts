export class DatabaseInitError extends Error {
	public constructor() {
		super("Failed to initialize database", {})
	}
}
