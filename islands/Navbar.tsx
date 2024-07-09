import { asset } from "$fresh/runtime.ts"
import { LanguageMenu, Show, ThemeToggle } from "components"
import { config } from "config"
import { Context, Theme } from "context"
import { supportedLanguages, useLanguage } from "lang"
import classNames from "classnames"

export interface NavbarProps {
	ctx: Context
}

/**
 * Creates a fixed navigation bar at the top of the page
 */
export const Navbar = ({ ctx }: NavbarProps) => {
	const [lang, setLang] = useLanguage(ctx.lang)
	return (
		<nav class="fixed z-20 w-full top-0 start-0 bg-gray-50 shadow dark:bg-gray-900">
			<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
				<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
					<Show if={config.branding.showLogo}>
						<img class={classNames("h-8", { "invert-1": ctx.theme === Theme.Dark && config.branding.invertLogo })} src={asset("/images/Icon.png")} />
					</Show>
					<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
						{config.branding.appName}
					</span>
				</a>
				<div class="flex items-center md:order-2 space-x-1 md:space-x-0 rtl:space-x-reverse">
					<ThemeToggle />
					<LanguageMenu language={lang} setLanguage={setLang} languages={supportedLanguages} />
				</div>
			</div>
		</nav>
	)
}
