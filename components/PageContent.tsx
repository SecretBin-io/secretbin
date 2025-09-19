import { clsx } from "@nick/clsx"
import { Show } from "components"
import { ComponentChild, ComponentChildren } from "preact"
import { BaseProps } from "./base.ts"

export interface PageContentProps extends BaseProps {
	/** Title of the page */
	title: string

	/** Description of what the page is for */
	description?: string

	children?: ComponentChildren
}

/**
 * Displays a given text above the wrapped component
 */
export function PageContent({ title, description, children, ...props }: PageContentProps): ComponentChild {
	return (
		<div class={clsx("mx-auto flex max-w-screen-md flex-col items-center justify-center", props.class)}>
			<div class="w-full p-4">
				<h5 class="mb-2 font-bold text-3xl">
					{title}
				</h5>
				<Show if={description}>
					<p class="mb-5 text-base">
						{description}
					</p>
				</Show>
				{children}
			</div>
		</div>
	)
}
