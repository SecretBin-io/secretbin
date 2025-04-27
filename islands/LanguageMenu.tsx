import { Language, supportedLanguages } from "lang"
import Cookies from "@nihility-io/cookies"
import { DropdownMenu } from "components"

export interface LanguageMenuProps {
	language: Language
}

/**
 * Creates a drop down menu for choosing your preferred language
 */
export const LanguageMenu = ({ language }: LanguageMenuProps) => {
	const setLanguage = (lang: Language) => {
		Cookies.set("lang", lang, {})
		globalThis.location.reload()
	}

	return (
		<DropdownMenu
			class="justify-center !px-4 !py-2 !mb-0 !me-0"
			icon="Language"
			label={supportedLanguages.find((x) => x.name === language)?.native}
			items={supportedLanguages.map((x) => ({
				label: `${x.label} (${x.native})`,
				onClick: () => setLanguage(x.name),
			}))}
		/>
	)
}
