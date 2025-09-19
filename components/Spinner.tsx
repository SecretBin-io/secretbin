import { clsx } from "@nick/clsx"
import { ComponentChild } from "preact"
import { BaseProps } from "./base.ts"

export interface SpinnerProps extends BaseProps {
	/** Label shown beneath the spinner */
	label?: string

	/** Hide the spinner */
	hidden?: boolean
}

/**
 * Creates a message with a title wrapped in a colored box
 */
export function Spinner({ label, hidden, ...props }: SpinnerProps): ComponentChild {
	if (hidden) {
		return undefined
	}

	return (
		<div
			class={clsx(
				"grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible",
				props.class,
			)}
		>
			<span class="loading loading-spinner loading-xl w-32"></span>
			{label
				? (
					<span class="mt-2">
						{label}
						<span class="custom-loading-dots"></span>
					</span>
				)
				: undefined}
		</div>
	)
}
