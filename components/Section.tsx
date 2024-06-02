import classNames from "classnames"
import { Show } from "components"
import { JSX, VNode } from "preact"
import { BaseProps } from "./helpers.ts"

export interface SectionProps extends BaseProps {
	/** Title shown above the section */
	title: string

	/** Optional smaller text below the title */
	description?: string

	children: VNode<JSX.HTMLAttributes> | VNode<JSX.HTMLAttributes>[]
}

/**
 * Displays a given text above the wrapped component
 */
export const Section = ({ title, description, children, ...props }: SectionProps) => (
	<div
		style={props.style}
		class={classNames("mx-auto py-2", props.class)}
	>
		<label
			for={Array.isArray(children) ? undefined : children.props.id}
			class="font-medium text-gray-900 dark:text-gray-300"
		>
			{title}
		</label>
		<Show if={description}>
			<p class="text-xs font-normal text-gray-500 dark:text-gray-400">
				{description}
			</p>
		</Show>
		<div class="py-2">
			{children}
		</div>
	</div>
)
