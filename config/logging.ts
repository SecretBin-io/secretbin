import { z, ZodType } from "zod"

export type LogLevel = "debug" | "info" | "warning" | "error" | "fatal"
const LogLevel: ZodType<LogLevel> = z.enum(["debug", "info", "warning", "error", "fatal"])

export type LogMode = "text" | "json"
const LogMode: ZodType<LogMode> = z.enum(["text", "json"])

/**
 * Configs logging behavior
 */
export interface Logging {
	/** Logging level (default: info) */
	level: LogLevel

	/** Specifies if logs should be rendered as text or JSON (default: text) */
	mode: LogMode

	/** Enable web access logging (default: false) */
	logAccess: boolean
}

export const Logging: ZodType<Logging> = z.strictInterface({
	level: LogLevel.default("info"),
	mode: LogMode.default("text"),
	logAccess: z.boolean().default(false),
})
