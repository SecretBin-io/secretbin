import { ComponentChildren } from "preact"
import { BaseProps } from "./helpers.ts"
import classNames from "classnames"

export interface TooltipProps extends BaseProps {
	/** Text that should be shown when hovering */
	text?: string

	children?: ComponentChildren
}

export const Tooltip = ({ text, children, ...props }: TooltipProps) => {
	if (!text) {
		return children
	}

	return (
		<div class="has-tooltip">
			<span
				style={props.style}
				class={classNames(
					"tooltip rounded shadow-lg border-1 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white py-1 px-2 -mt-10",
					props.class,
				)}
			>
				{text}
			</span>
			{children}
		</div>
	)
}
