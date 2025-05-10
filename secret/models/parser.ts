import { SecretParseError } from "secret/models"
import z, { ZodType } from "zod"

/**
 * Parses an object using a given Zod model
 * @param m Zod Model
 * @param obj Object to parse
 * @returns Parsed result
 */
export const parseModel = async <T>(m: ZodType<T>, obj: unknown): Promise<T> => {
	try {
		return await m.parseAsync(obj)
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw new SecretParseError(err.issues)
		}
		throw new SecretParseError([])
	}
}
