import * as log from "@std/log"
import { type LogRecord } from "@std/log"
import { config } from "config"

const flattenArgs = (args: unknown[]): unknown => {
	if (args.length === 1) {
		return args[0]
	} else if (args.length > 1) {
		return args
	}
}

log.setup({
	handlers: {
		console: new log.ConsoleHandler(config.logging.level, {
			formatter: (logRecord: LogRecord): string => {
				return JSON.stringify({
					level: logRecord.levelName,
					timestamp: logRecord.datetime.toISOString(),
					logger: logRecord.loggerName,
					message: logRecord.msg,
					args: flattenArgs(logRecord.args),
				})
			},
			useColors: false,
		}),
	},
	loggers: {
		default: {
			level: config.logging.level,
			handlers: ["console"],
		},
		secrets: {
			level: config.logging.level,
			handlers: ["console"],
		},
		gc: {
			level: config.logging.level,
			handlers: ["console"],
		},
		db: {
			level: config.logging.level,
			handlers: ["console"],
		},
	},
})

/** Secrets logs */
export const logSecrets = log.getLogger("secrets")

/** Garbage collector logs */
export const logCG = log.getLogger("gc")

/** Database logs */
export const logDB = log.getLogger("db")
