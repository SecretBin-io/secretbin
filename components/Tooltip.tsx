import { ComponentChildren, JSX } from "preact"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

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
				class={clsx(
					"tooltip -mt-10 rounded border-1 border-gray-300 bg-gray-100 px-2 py-1 text-black shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white",
					props.class,
				)}
			>
				{text}
			</span>
			{children}
		</div>
	)
}
