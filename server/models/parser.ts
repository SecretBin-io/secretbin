import z from "@zod/zod"
import { SecretSubmission } from "models"
import { SecretParseError } from "utils/errors"

export const secretSubmission = z.strictObject({
	data: z.string().startsWith("crypto://"),
	dataBytes: z.instanceof(Uint8Array).optional().or(z.null()),
	expires: z.string().regex(/^(\d+)(min|hr|d|w|m)$/),
	burnAfter: z.number().default(-1),
	passwordProtected: z.boolean().default(false),
})

/**
 * Validates and parses a secret submission.
 * @param submission Secret submission to parse
 * @returns Validated secret submission
 * @throws {SecretParseError} If the submission is invalid
 */
export async function parseSecretSubmission(submission: unknown): Promise<SecretSubmission> {
	try {
		return await secretSubmission.parseAsync(submission)
	} catch (err) {
		if (err instanceof z.ZodError) {
			throw new SecretParseError(err.issues)
		}
		throw new SecretParseError([])
	}
}
