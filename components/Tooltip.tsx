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
		<div class="tooltip" data-tip={text} {...props}>
			{children}
		</div>
	)
}
