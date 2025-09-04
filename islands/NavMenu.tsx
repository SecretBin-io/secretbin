import { LanguageIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { Cookies } from "@nihility-io/cookies"
import { Button, Dropdown, DropdownItem } from "components"
import { Language, supportedLanguages } from "lang"
import { JSX } from "preact"
import { useEffect } from "preact/hooks"
import { useSetting } from "utils/hooks"
import { State, Theme } from "utils/state"

export interface NavMenuProps {
	state: State
}

export function NavMenu({ state }: NavMenuProps): JSX.Element {
	const [theme, setTheme] = useSetting(
		"theme",
		typeof document !== "undefined"
			? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light
			: Theme.Light,
		state,
	)

	useEffect(() => {
		if (theme === Theme.Dark) {
			globalThis.document.documentElement.classList.add("dark")
			globalThis.document.documentElement.classList.remove("light")
		} else {
			globalThis.document.documentElement.classList.add("light")
			globalThis.document.documentElement.classList.remove("dark")
		}
	}, [theme])

	const setLanguage = (lang: Language) => {
		Cookies.set("language", lang, {})
		globalThis.location.reload()
	}

	return (
		<>
			<Button
				class="!me-0 !mb-0 justify-center !px-4 !py-2"
				theme="clear"
				icon={theme === Theme.Dark ? SunIcon : MoonIcon}
				onClick={() => setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)}
			/>
			<Dropdown
				class="!me-0 !mb-0 justify-center !px-4 !py-2"
				dropdownClass="right-0 w-40"
				icon={LanguageIcon}
				label={supportedLanguages.find((x) => x.name === state.language)?.native}
			>
				{supportedLanguages.map(({ label, native, name }) => (
					<DropdownItem
						label={`${label} (${native})`}
						onClick={() => setLanguage(name)}
					/>
				))}
			</Dropdown>
		</>
	)
}
