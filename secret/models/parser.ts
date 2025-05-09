import { SecretParseError } from "secret/models"
import z from "zod"

/**
 * Creates a result based parser function for a given Zod model
 * @param m Zod Model
 * @returns Parser function
 */
export const parseModel = async <T extends z.ZodType, R extends z.infer<T>>(m: T, obj: unknown): Promise<R> => {
	try {
		return await (m.parseAsync(obj) as Promise<R>)
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw new SecretParseError(err.issues)
		}
		throw new SecretParseError([])
	}
}
