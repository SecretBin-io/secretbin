import { Cookies, useCookie } from "@nihility-io/cookies"
import { Button, Dropdown } from "components"
import { useEffect } from "preact/hooks"
import { State, Theme } from "state"
import { Language, supportedLanguages } from "lang"

export interface NavMenuProps {
	state: State
}

export const NavMenu = ({ state }: NavMenuProps) => {
	const [theme, setTheme] = useCookie(
		"theme",
		typeof document !== "undefined"
			? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light
			: Theme.Light,
		{ expires: 3650 },
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
		Cookies.set("lang", lang, {})
		globalThis.location.reload()
	}

	return (
		<>
			<Button
				class="justify-center !px-4 !py-2 !mb-0 !me-0"
				theme="clear"
				icon={theme === Theme.Dark ? "Sun" : "Moon"}
				onClick={() => setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)}
			/>
			<Dropdown
				class="justify-center !px-4 !py-2 !mb-0 !me-0"
				dropdownClass="right-0 w-40"
				icon="Language"
				label={supportedLanguages.find((x) => x.name === state.lang)?.native}
				items={supportedLanguages.map((x) => ({
					label: `${x.label} (${x.native})`,
					onClick: () => setLanguage(x.name),
				}))}
			/>
		</>
	)
}
