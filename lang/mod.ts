import de from "./de.ts"
import en from "./en.ts"
import { FlattenObjectKeys, formatString, TrimPrefix } from "./helpers.ts"

export { type TrimPrefix } from "./helpers.ts"
export * from "./error.ts"

/**
 * Currently supported languages
 */
export enum Language {
	English = "en",
	German = "de",
}

const translations = { [Language.English]: en, [Language.German]: de }

export interface SupportedLanguage {
	name: Language
	label: string
	native: string
}

/**
 * Metadata of the supported languages
 */
export const supportedLanguages: SupportedLanguage[] = [
	{ name: Language.English, label: "English", native: "English" },
	{ name: Language.German, label: "German", native: "Deutsch" },
]

/**
 * Checks if a language code is supported
 * @param lang Language code
 */
export const isLanguageSupported = (lang: string): boolean => !!supportedLanguages.find((x) => x.name === lang)

/**
 * List of all translated keys
 */
export type TranslationKey = FlattenObjectKeys<typeof en.Translations>

/**
 * Renders a translated string with the given parameters
 * @param key Translation key
 * @param params Optional parameters for the translated string
 */
export type TranslationFunction = (key: TranslationKey, params?: Record<string, string>) => string

/**
 * Gets the translation for the given key in the given language
 * @param lang Language to use
 * @param key Translation key
 * @param params Optional parameters for the translated
 */
export const getTranslation = (lang: Language, key: TranslationKey, params?: Record<string, string>): string => {
	// deno-lint-ignore no-explicit-any
	let o: any = translations[lang].Translations
	for (const k of key.split(".")) {
		if (o === undefined) {
			break
		}

		o = o[k]
	}

	if (typeof o !== "string") {
		if (lang !== Language.English) {
			// deno-lint-ignore react-rules-of-hooks
			return useTranslation(Language.English)(key, params)
		}
		return `{${key}}`
	}

	if (params === undefined) {
		return o
	}

	return formatString(o, params)
}

/**
 * Creates a translation function for the given language which can be used to get the translated string
 * @param lang Language to use
 * @returns Translation function
 */
export const useTranslation = (lang: Language): TranslationFunction => (path, params): string =>
	getTranslation(lang, path, params)

/**
 * Preact hook for using translations based on the current language
 * @param initialLanguage Language used until the language cookie is read on the client's side. Optimally set this value using the `state.language`
 * @returns Translate function
 * @example
 * export default () => {
 *     const $ = useTranslationWithPrefix(Language.English, "Home")
 *     return (
 *        <h1>$("Greeting", { name: "John Smith" })</h1>
 *     )
 * }
 */
export const useTranslationWithPrefix =
	<P extends string>(initialLanguage: Language, prefix: P) =>
	(key: TrimPrefix<P, TranslationKey>, params?: Record<string, string>) =>
		useTranslation(initialLanguage)(prefix + "." + key as unknown as TranslationKey, params)
