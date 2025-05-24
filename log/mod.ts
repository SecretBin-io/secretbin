import { configure, getAnsiColorFormatter, getConsoleSink, getLogger, getTextFormatter } from "@logtape/logtape"
import { config } from "config"

const lowestLevel = config.logging.level
const sinks = [`${config.logging.mode}Console`]

// Configure LogTape
await configure({
	sinks: {
		// Logs colorful text based logs to the console
		textConsole: getConsoleSink({
			formatter: getAnsiColorFormatter({
				timestamp: "date-time",
				timestampColor: "cyan",
				format: ({ timestamp, level, category, message, record }) => {
					const { error } = record.properties
					if (error instanceof Error) {
						return `${timestamp} ${level} ${category} ${message} \x1b[31m[${error.name}: ${error.message}]\x1b[0m`
					}
					return `${timestamp} ${level} ${category} ${message}`
				},
			}),
		}),
		// Logs JSON encoded logs to the console
		jsonConsole: getConsoleSink({
			formatter: getTextFormatter({
				timestamp: "rfc3339",
				format: ({ timestamp, level, category, message, record }) => {
					const { error, ...properties } = record.properties
					return JSON.stringify({ timestamp, level, category, message, error, properties })
				},
			}),
		}),
	},
	loggers: [
		{ category: "web", lowestLevel, sinks: config.logging.logAccess ? sinks : [] },
		{ category: "secrets", lowestLevel, sinks },
		{ category: "garbageCollection", lowestLevel, sinks },
		{ category: "database", lowestLevel, sinks },
		{ category: ["logtape", "meta"], sinks: [] },
	],
})

/** Web logs */
export const logWeb = getLogger("web")

/** Secrets logs */
export const logSecrets = getLogger("secrets")

/** Garbage collector logs */
export const logCG = getLogger("garbageCollection")

/** Database logs */
export const logDB = getLogger("database")
