import classNames from "classnames"
import { Show, Tooltip } from "components"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"

export interface ToggleProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

	/** Text next to the toggle */
	label: string

	/** Optional smaller text below the label */
	subLabel?: string

	/** Current toggle state */
	on?: boolean

	/** Makes checkbox readonly */
	disabled?: boolean

	/** Text shown when the user hovers over the element */
	tooltip?: string

	/** Function called when the state changes */
	onChange?: (checked: boolean) => void
}

/**
 * Creates a checkable toggle
 */
export function Toggle(
	{ id, label, subLabel, on, onChange, tooltip, disabled, ...props }: ToggleProps,
): JSX.Element {
	return (
		<Tooltip text={tooltip}>
			<div class="flex mb-4" style={props.style}>
				<div
					class={classNames("flex-none", { "mt-1": subLabel, "brightness-75": disabled })}
				>
					<div
						{...props}
						class={classNames("relative inline-flex items-center cursor-pointer", props.class)}
						onClick={() => !disabled && onChange?.(!on)}
					>
						<input
							id={id}
							type="checkbox"
							disabled={disabled}
							checked={on}
							class="sr-only peer"
							onInput={(e) => !disabled && onChange?.(e.currentTarget.checked)}
						/>
						<div
							class={classNames(
								"w-11 h-6 border-1 border-gray-300 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600",
								{
									"peer-checked:bg-gray-600": disabled,
								},
							)}
						>
						</div>
					</div>
				</div>

				<div class="flex-1">
					<div class="ms-2 text-sm">
						<label class="font-medium text-gray-900 dark:text-gray-300">
							{label}
						</label>
						<Show if={subLabel}>
							<p class="text-xs font-normal text-gray-500 dark:text-gray-400">
								{subLabel}
							</p>
						</Show>
					</div>
				</div>
			</div>
		</Tooltip>
	)
}
