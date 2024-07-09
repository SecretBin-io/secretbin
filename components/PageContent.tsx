import { Show } from "components"
import { ComponentChildren } from "preact"
import { BaseProps } from "./helpers.ts"

export interface PageContentProps extends BaseProps {
	/** Title of the page */
	title: string

	/** Description of what the page is for */
	description?: string

	children: ComponentChildren
}

/**
 * Displays a given text above the wrapped component
 */
export const PageContent = ({ title, description, children }: PageContentProps) => (
	<div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
		<div class="w-full p-4">
			<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
				{title}
			</h5>
			<Show if={description}>
				<p class="mb-5 text-base text-gray-500 dark:text-gray-400">
					{description}
				</p>
			</Show>
			{children}
		</div>
	</div>
)
