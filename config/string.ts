import z from "zod"

/**
 * Record where the keys are the languages codes and the value are the
 * string in that respective language
 */
export type TranslatedString = Record<string, string>
export const TranslatedString = z.record(
	z.string(),
	z.union([
		z.string(),
		z.object({ file: z.string() })
			.transform(({ file }) => Deno.readTextFileSync(file)),
	]),
)
