import { getTranslation, Language, TranslationFunction, TranslationKey } from "lang"
import { TrimPrefix } from "utils/helpers"

/**
 * Creates a translation function for the given language which can be used to get the translated string
 * @param lang Language to use
 * @returns Translation function
 */
export function useTranslation(lang: Language): TranslationFunction

/**
 * Preact hook for using translations based on the current language
 * @param lang Language to use
 * @returns Translate function
 * @example
 * export default () => {
 *     const $ = useTranslationWithPrefix(Language.English, "Home")
 *     return (
 *        <h1>$("Greeting", { name: "John Smith" })</h1>
 *     )
 * }
 */
export function useTranslation<P extends string>(
	lang: Language,
	prefix: P,
): TranslationFunction<TrimPrefix<P, TranslationKey>>

export function useTranslation(lang: Language, prefix?: unknown): unknown {
	if (prefix !== undefined) {
		return (key: TranslationKey, params?: Record<string, string>) =>
			useTranslation(lang)(prefix + "." + key as unknown as TranslationKey, params)
	}

	return (key: TranslationKey, params?: Record<string, string>): string => getTranslation(lang, key, params)
}
