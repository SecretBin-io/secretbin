import { Show, Tooltip } from "components"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

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
			<div class="mb-4 flex" style={props.style}>
				<div
					class={clsx("flex-none", { "mt-1": subLabel, "brightness-75": disabled })}
				>
					<div
						{...props}
						class={clsx("relative inline-flex cursor-pointer items-center", props.class)}
						onClick={() => !disabled && onChange?.(!on)}
					>
						<input
							id={id}
							type="checkbox"
							disabled={disabled}
							checked={on}
							class="peer sr-only"
							onInput={(e) => !disabled && onChange?.(e.currentTarget.checked)}
						/>
						<div
							class={clsx(
								"peer h-6 w-11 rounded-full border-1 border-gray-300 bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800",
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
							<p class="font-normal text-gray-500 text-xs dark:text-gray-400">
								{subLabel}
							</p>
						</Show>
					</div>
				</div>
			</div>
		</Tooltip>
	)
}
