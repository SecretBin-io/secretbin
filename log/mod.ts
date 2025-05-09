import { config } from "config"

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"

export class Logger {
	name: string

	/**
	 * Creates a new logger instance
	 * @param name Name of the logger
	 */
	constructor(name: string) {
		this.name = name
	}

	/**
	 * Sets the logging level for all loggers
	 * @param level Logging level
	 */
	public static level: LogLevel = config.logging.level === "NOTSET" ? "INFO" : config.logging.level

	/**
	 * Returns the number of the log level
	 * @param level Log level
	 * @returns Log level number (DEBUG = 4, INFO = 3, WARN = 2, ERROR = 1, CRITICAL = 0)
	 */
	public static levelNumber(level: LogLevel): number {
		return Logger.#logLevels[level]
	}

	/**
	 * Logs a message to the console
	 * @param level Log level
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	#log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (Logger.#logLevels[level] > Logger.#logLevels[Logger.level]) {
			return
		}

		console.log(JSON.stringify({
			level: level,
			timestamp: new Date().toISOString(),
			logger: this.name,
			message: message,
			args: Logger.#flattenArgs(args),
		}))
	}

	/**
	 * Logs a message to the console (debug level)
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	public debug(message: string, ...args: unknown[]): void {
		this.#log("DEBUG", message, ...args)
	}

	/**
	 * Logs a message to the console (info level)
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	public info(message: string, ...args: unknown[]): void {
		this.#log("INFO", message, ...args)
	}

	/**
	 * Logs a message to the console (warn level)
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	public warn(message: string, ...args: unknown[]): void {
		this.#log("WARN", message, ...args)
	}

	/**
	 * Logs a message to the console (error level)
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	public error(message: string, ...args: unknown[]): void

	/**
	 * Logs a message to the console (error level)
	 * @param err Error to log
	 * @param args Optional arguments to include in the log
	 */
	public error(err: Error, ...args: unknown[]): void

	/**
	 * Logs a message to the console (error level)
	 * @param arg Error or message to log
	 * @param args Optional arguments to include in the log
	 */
	public error(arg: string | Error, ...args: unknown[]): void {
		if (typeof arg === "string") {
			if (arg.length === 1 && args[0] instanceof Error) {
				this.#log("ERROR", arg, {
					error: { name: args[0].name, message: args[0].message },
				})
			} else {
				this.#log(
					"ERROR",
					arg,
					...args.map((a) => {
						if (a instanceof Error) {
							return { error: { name: a.name, message: a.message } }
						} else if (typeof a === "object") {
							const { error, ...test } = a as Record<string, unknown>
							if (a instanceof Error) {
								return { ...test, error: { name: a.name, message: a.message } }
							}
							return { ...test, error }
						} else {
							return a
						}
					}),
				)
			}
		} else {
			this.#log("ERROR", `${arg.name}: ${arg.message}`, ...args)
		}
	}

	/**
	 * Logs a message to the console (critical level)
	 * @param message Message to log
	 * @param args Optional arguments to include in the log
	 */
	public critical(message: string, ...args: unknown[]): void {
		this.#log("CRITICAL", message, ...args)
	}

	/**
	 * Returns the first argument if there is only one,
	 * otherwise returns the entire array.
	 * @param args List of arguments
	 * @returns Flattened argument(s)
	 */
	static #flattenArgs(args: unknown[]): unknown {
		if (args.length === 1) {
			return args[0]
		} else if (args.length > 1) {
			return args
		}
	}

	/**
	 * Maps log level names to the log level number
	 */
	static readonly #logLevels: Record<LogLevel, number> = {
		DEBUG: 4,
		INFO: 3,
		WARN: 2,
		ERROR: 1,
		CRITICAL: 0,
	}
}

/** Web logs */
export const logWeb = new Logger("web")

/** Secrets logs */
export const logSecrets = new Logger("secrets")

/** Garbage collector logs */
export const logCG = new Logger("gc")

/** Database logs */
export const logDB = new Logger("db")
