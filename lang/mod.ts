import de from "./de.ts"
import en from "./en.ts"
import { FlattenObjectKeys, formatString, TrimPrefix } from "./helpers.ts"

export { type TrimPrefix } from "./helpers.ts"

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

export const useTranslation = (lang: Language) => (path: TranslationKey, params?: Record<string, string>): string => {
	// deno-lint-ignore no-explicit-any
	let o: any = translations[lang].Translations
	for (const key of path.split(".")) {
		if (o === undefined) {
			break
		}

		o = o[key]
	}

	if (typeof o !== "string") {
		if (lang !== Language.English) {
			// deno-lint-ignore react-rules-of-hooks
			return useTranslation(Language.English)(path, params)
		}
		return `{${path}}`
	}

	if (params === undefined) {
		return o
	}

	return formatString(o, params)
}

/**
 * Preact hook for using translations based on the current language
 * @param initialLanguage Language used until the language cookie is read on the client's side. Optimally set this value using the `state.lang`
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
