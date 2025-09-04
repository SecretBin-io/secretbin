import z, { ZodType } from "@zod/zod"
import { SecretParseError } from "utils/errors"

/**
 * Parses an object using a given Zod model
 * @param m Zod Model
 * @param obj Object to parse
 * @returns Parsed result
 */
export async function parseModel<T>(m: ZodType<T>, obj: unknown): Promise<T> {
	try {
		return await m.parseAsync(obj)
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw new SecretParseError(err.issues)
		}
		throw new SecretParseError([])
	}
}
