import { Button } from "components"
import { useEffect, useRef } from "preact/hooks"
import { Language, supportedLanguages } from "lang"
import Cookies from "@nihility-io/cookies"

export interface LanguageMenuProps {
	language: Language
}

/**
 * Creates a drop down menu for choosing your preferred language
 */
export const LanguageMenu = ({ language }: LanguageMenuProps) => {
	const targetRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		// This is necessary since my primary web browser, Safari, is weird and didn't load Flowbite correctly
		import("flowbite").then(({ initDropdowns }) => initDropdowns())
	}, [])

	const setLanguage = (lang: Language) => {
		Cookies.set("lang", lang, {})
		globalThis.location.reload()
	}

	return (
		<>
			<Button
				overrideClass
				class="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
				icon="Message"
				label={supportedLanguages.find((x) => x.name === language)?.native}
				dropdown="language-dropdown-menu"
			/>

			<div
				ref={targetRef}
				id="language-dropdown-menu"
				class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
			>
				<ul class="py-2 font-medium" role="none">
					{supportedLanguages.map((x) => (
						<li>
							<button
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem"
								onClick={(e) => setLanguage(x.name)}
							>
								<div class="inline-flex items-center">
									{x.label} ({x.native})
								</div>
							</button>
						</li>
					))}
				</ul>
			</div>
		</>
	)
}
