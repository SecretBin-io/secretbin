import classNames from "classnames"
import { ComponentChildren, JSX } from "preact"
import { BaseProps } from "./base.ts"

export interface TooltipProps extends BaseProps {
	/** Text that should be shown when hovering */
	text?: string

	children?: ComponentChildren
}

export function Tooltip({ text, children, ...props }: TooltipProps): JSX.Element | ComponentChildren {
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
