import classNames from "classnames"
import { BaseProps } from "../components/helpers.ts"
import { config } from "config"
import { useLanguage, useTranslation } from "lang"
import { Context } from "context"

export interface FooterProps extends BaseProps {
	ctx: Context
}

/**
 * Creates a small fixed bar on the bottom of the page
 */
export const Footer = ({ ctx, ...props }: FooterProps) => {
	const [lang] = useLanguage(ctx.lang)
	const $ = useTranslation(ctx.lang)

	return (
		<footer
			style={props.style}
			class={classNames(
				"fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600",
				props.class,
			)}
		>
			<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
				{config.branding.footer}
			</span>
			<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
				{config.branding.links.map((link) => (
					<li>
						<a
							href={link.link[lang] ?? link.link.en}
							target="_blank"
							class="hover:underline me-4 md:me-6"
						>
							{link.name[lang] ?? link.name.en}
						</a>
					</li>
				))}
				<li>
					<a
						href="/credits"
						class="hover:underline me-4 md:me-6"
					>
						{$("Credits.Title")}
					</a>
				</li>
			</ul>
		</footer>
	)

}