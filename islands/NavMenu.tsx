import { LanguageIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { Cookies } from "@nihility-io/cookies"
import { Button } from "components"
import { Language, supportedLanguages } from "lang"
import { ComponentChild } from "preact"
import { useEffect } from "preact/hooks"
import { useSetting } from "utils/hooks"
import { State, Theme } from "utils/state"

export interface NavMenuProps {
	state: State
}

export function NavMenu({ state }: NavMenuProps): ComponentChild {
	const [theme, setTheme] = useSetting(
		"theme",
		typeof document !== "undefined"
			? globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.Dark : Theme.Light
			: Theme.Light,
		state,
	)

	useEffect(() => {
		if (theme === Theme.Dark) {
			globalThis.document.documentElement.dataset.theme = "dark"
		} else {
			globalThis.document.documentElement.dataset.theme = "light"
		}
	}, [theme])

	const setLanguage = (lang: Language) => {
		Cookies.set("language", lang, {})
		globalThis.location.reload()
	}

	return (
		<>
			<ul class="menu menu-horizontal px-1">
				<li>
					<Button
						class="!me-0 !mb-0 justify-center !px-4 !py-2"
						theme="clear"
						icon={theme === Theme.Dark ? SunIcon : MoonIcon}
						onClick={() => setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)}
					/>
				</li>
				<li>
					<details>
						<summary>
							<LanguageIcon class="me-2 h-6 w-6" />
							{supportedLanguages.find((x) => x.name === state.language)?.native ?? "Language"}
						</summary>
						<ul class="right-0 w-40 rounded-t-none bg-base-100 p-2">
							{supportedLanguages.map(({ label, native, name }) => (
								<li>
									<a onClick={() => setLanguage(name)}>{label} ({native})</a>
								</li>
							))}
						</ul>
					</details>
				</li>
			</ul>
		</>
	)
}
