import Result from "@nihility-io/result"
import { SecretParseError } from "secret/models"
import z from "zod"

/**
 * Creates a result based parser function for a given Zod model
 * @param m Zod Model
 * @returns Parser function
 */
export const parseModel = <T extends z.ZodType, R extends z.infer<T>>(m: T, obj: unknown): Result<R> =>
	Result.fromTry<R>(() => {
		try {
			return m.parse(obj) as R
		} catch (err) {
			throw new SecretParseError((err as unknown as z.ZodError).issues)
		}
	})
