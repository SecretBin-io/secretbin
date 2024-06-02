import { Button, Icon } from "components"
import { initDropdowns } from "flowbite"
import { useEffect, useRef } from "preact/hooks"

export interface Language<LanguageName> {
	name: LanguageName
	label: string
	native: string
}

export interface LanguageMenuProps<LanguageName> {
	language: string
	setLanguage: (lang: LanguageName) => void
	languages: Language<LanguageName>[]
}

/**
 * Creates a drop down menu for choosing your preferred language
 */
export const LanguageMenu = <LanguageName,>({ language, setLanguage, languages }: LanguageMenuProps<LanguageName>) => {
	const targetRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		// This is necessary since my primary web browser, Safari, is weird and didn't load Flowbite correctly
		initDropdowns()
	}, [])

	return (
		<>
			<Button
				overrideClass
				class="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
				svg={<Icon.AnnotationSolid class="mr-2" />}
				label={languages.find((x) => x.name === language)?.native}
				dropdown="language-dropdown-menu"
			/>

			<div
				ref={targetRef}
				id="language-dropdown-menu"
				class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
			>
				<ul class="py-2 font-medium" role="none">
					{languages.map((x) => (
						<li>
							<button
								href="#"
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
								role="menuitem"
								onClick={(e) => {
									setLanguage(x.name)
									// new Dropdown(targetRef.current!, e.currentTarget, { placement: "bottom-end" })
									// 	.hide()
								}}
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
