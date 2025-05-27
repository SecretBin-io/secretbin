import { STATUS_TEXT } from "@std/http/status"
import { getTranslation, Language, TranslationKey } from "lang"
import { TrimPrefix, TrimSuffix } from "./helpers.ts"

export type ErrorKey = TrimSuffix<"Title", TrimPrefix<"Errors", TranslationKey>>

/**
 * Error type which enables localized translated error messages
 */
export class LocalizedError extends Error {
	#key: ErrorKey
	#params: Record<string, string>

	/**
	 * HTTP status code for the error, used to determine the response status
	 */
	public readonly status: keyof typeof STATUS_TEXT

	/**
	 * Create a new localized error. Note: The error name is set to the translation key name by default
	 * @param status HTTP status code
	 * @param key Translation key for the error
	 * @param params Optional parameters for the translated message
	 */
	public constructor(
		status: keyof typeof STATUS_TEXT,
		key: ErrorKey,
		params: Record<string, string> = {},
	) {
		super(getTranslation(Language.English, `Errors.${key}.Message`, params))
		this.status = status
		this.name = key
		this.#key = key
		this.#params = params
	}

	/**
	 * Gets the error message in the desired language
	 * @param lang Requested language
	 * @returns Translated error message
	 */
	public getMessage(lang: Language): string {
		return getTranslation(lang, `Errors.${this.#key}.Message`, this.#params)
	}

	/**
	 * Gets the error message in the desired language. If the error is not an localized error, the normal
	 * message is returned instead.
	 * @param lang Requested language
	 * @param err Error
	 * @returns Translated error message
	 */
	public static getMessage(lang: Language, err: Error): string {
		if (err instanceof LocalizedError) {
			return err.getMessage(lang)
		} else {
			return err.message
		}
	}

	/**
	 * Gets the error title in the desired language.
	 * @param lang Requested language
	 * @returns Translated error title
	 */
	public getTitle(lang: Language): string {
		return getTranslation(lang, `Errors.${this.#key}.Title`, this.#params)
	}

	/**
	 * Gets the error title in the desired language. If the error is not an localized error, the error
	 * name is returned instead.
	 * @param lang Requested language
	 * @param err Error
	 * @returns Translated error title
	 */
	public static getTitle(lang: Language, err: Error): string {
		if (err instanceof LocalizedError) {
			return err.getTitle(lang)
		} else {
			return err.message
		}
	}
}
