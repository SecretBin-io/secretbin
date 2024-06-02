import classNames from "classnames"
import { BaseProps } from "../components/helpers.ts"

export interface FooterLink {
	/** Display text */
	name: string

	/** Actual link */
	link: string

	/** Set if link should open in a new tab */
	newTab: boolean
}

export interface FooterProps extends BaseProps {
	/** Text displayed on the left hand side of the footer e.g. a copyright note */
	text: string

	/** Links displayed on the right hand side of the footer */
	links: FooterLink[]
}

/**
 * Creates a small fixed bar on the bottom of the page
 */
export const Footer = ({ text, links, ...props }: FooterProps) => (
	<footer
		style={props.style}
		class={classNames(
			"fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600",
			props.class,
		)}
	>
		<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
			{text}
		</span>
		<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
			{links.map((link) => (
				<li>
					<a
						href={link.link}
						target={link.newTab ? "_blank" : undefined}
						class="hover:underline me-4 md:me-6"
					>
						{link.name}
					</a>
				</li>
			))}
		</ul>
	</footer>
)
