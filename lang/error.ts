import { STATUS_CODE } from "@std/http/status"
import { TrimPrefix } from "./helpers.ts"
import { getTranslation, Language, TranslationKey } from "lang"

/**
 * Error type which enables localized translated error messages
 */
export class LocalizedError extends Error {
	#key: TrimPrefix<"Errors", TranslationKey>
	#params: Record<string, string>

	/**
	 * HTTP status code for the error
	 */
	public code: number = STATUS_CODE.BadRequest

	/**
	 * Create a new localized error. Note: The error name is set to the translation key name by default
	 * @param key Translation key for the error
	 * @param params Optional parameters for the translated message
	 */
	public constructor(
		key: TrimPrefix<"Errors", TranslationKey>,
		params: Record<string, string> = {},
	) {
		super(getTranslation(Language.English, `Errors.${key}`, params))
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
		return getTranslation(lang, `Errors.${this.#key}`, this.#params)
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
