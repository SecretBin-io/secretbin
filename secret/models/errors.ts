import { TrimPrefix, useTranslation } from "lang"
import Result from "@nihility-io/result"
import { humanReadableSize } from "helpers"
import { Language, TranslationKey } from "lang"
import { z } from "zod"

/**
 * Register error types with @nihility-io/result in order to parse Results containing
 * these errors may be parsed correctly.
 */
Result.registerErrorType("SecretNotFoundError", (_message, { id }: { id: string }) => new SecretNotFoundError(id))
Result.registerErrorType(
	"SecretAlreadyExistsError",
	(_message, { id }: { id: string }) => new SecretAlreadyExistsError(id),
)
Result.registerErrorType("SecretListError", () => new SecretListError())
Result.registerErrorType("SecretReadError", (_message, { id }: { id: string }) => new SecretReadError(id))
Result.registerErrorType("SecretWriteError", (_message, { id }: { id: string }) => new SecretWriteError(id))
Result.registerErrorType("SecretDeleteError", (_message, { id }: { id: string }) => new SecretDeleteError(id))
Result.registerErrorType(
	"SecretParseError",
	(_message, { issues }: { issues: z.core.$ZodIssue[] }) => new SecretParseError(issues),
)
Result.registerErrorType(
	"SecretPolicyError",
	(_message, { reason }: { reason: string }) => new SecretPolicyError(reason),
)
Result.registerErrorType(
	"SecretSizeLimitError",
	(_message, { maxSize, size }: { maxSize: number; size: number }) => new SecretSizeLimitError(size, maxSize),
)

/**
 * Error type which enables localized translated error messages
 */
export class LocalizedError extends Error {
	#key: TrimPrefix<"Errors", TranslationKey>
	#params: Record<string, string>

	/**
	 * Create a new localized error. Note: The error name is set to the translation key name by default
	 * @param key Translation key for the error
	 * @param params Optional parameters for the translated message
	 */
	public constructor(key: TrimPrefix<"Errors", TranslationKey>, params: Record<string, string> = {}) {
		// deno-lint-ignore react-rules-of-hooks
		super(useTranslation(Language.English)("Errors." + key as unknown as TranslationKey, params))
		this.name = key
		this.#key = key
		this.#params = params
	}

	/**
	 * Gets the error message in the desired language
	 * @param lang Requested language
	 * @returns Translated error message
	 */
	public getLocalizedMessage(lang: Language) {
		// deno-lint-ignore react-rules-of-hooks
		return useTranslation(lang)("Errors." + this.#key as unknown as TranslationKey, this.#params)
	}

	/**
	 * Gets the error message in the desired language. If the error is not an localized error, the normal
	 * message is returned instead.
	 * @param lang Requested language
	 * @param err Error
	 * @returns Translated error message
	 */
	public static getLocalizedMessage(lang: Language, err: Error) {
		if (err instanceof LocalizedError) {
			return err.getLocalizedMessage(lang)
		} else {
			return err.message
		}
	}
}

/**
 * Implement a error sub-class for each error
 */

export class SecretNotFoundError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretNotFoundError", { id })
	}
}

export class SecretAlreadyExistsError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretAlreadyExistsError", { id })
	}
}

export class SecretListError extends LocalizedError {
	public constructor() {
		super("SecretListError")
	}
}

export class SecretReadError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretReadError", { id })
	}
}

export class SecretWriteError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretWriteError", { id })
	}
}

export class SecretDeleteError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretDeleteError", { id })
	}
}

export class SecretParseError extends LocalizedError {
	public constructor(public issues: z.core.$ZodIssue[]) {
		super("SecretParseError", { reasons: issues.map((x) => x.message).join(", ") })
	}
}

export class SecretPolicyError extends LocalizedError {
	public constructor(public reason: string) {
		super("SecretPolicyError", { reason })
	}
}

export class SecretSizeLimitError extends LocalizedError {
	public constructor(public size: number, public maxSize: number) {
		super("SecretSizeLimitError", { size: humanReadableSize(size), maxSize: humanReadableSize(maxSize) })
	}
}
