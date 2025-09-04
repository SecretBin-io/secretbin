import { FlattenObjectKeys, formatString } from "utils/helpers"
import de from "./de.ts"
import en from "./en.ts"

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
export function isLanguageSupported(lang: string): boolean {
	return !!supportedLanguages.find((x) => x.name === lang)
}

/**
 * List of all translated keys
 */
export type TranslationKey = FlattenObjectKeys<typeof en.Translations>

/**
 * Renders a translated string with the given parameters
 * @param key Translation key
 * @param params Optional parameters for the translated string
 */
export type TranslationFunction<Key extends string = TranslationKey> = (
	key: Key,
	params?: Record<string, string>,
) => string

/**
 * Gets the translation for the given key in the given language
 * @param lang Language to use
 * @param key Translation key
 * @param params Optional parameters for the translated
 */
export function getTranslation(lang: Language, key: TranslationKey, params?: Record<string, string>): string {
	let o: unknown = (translations[lang] ?? translations[Language.English]).Translations
	for (const k of key.split(".")) {
		if (o === undefined) {
			break
		}

		o = (o as Record<string, unknown>)[k]
	}

	if (typeof o !== "string") {
		if (lang !== Language.English) {
			return getTranslation(Language.English, key, params)
		}
		return `{${key}}`
	}

	if (params === undefined) {
		return o
	}

	return formatString(o, params)
}
