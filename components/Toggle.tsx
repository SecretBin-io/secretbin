import { clsx } from "@nick/clsx"
import { Signal } from "@preact/signals"
import { Show, Tooltip } from "components"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"

export interface ToggleProps extends BaseProps {
	/** Text next to the toggle */
	label: string

	/** Optional smaller text below the label */
	subLabel?: string

	/** Signal that stores the toggle state. Can be used instead of on and onChange */
	signal?: Signal<boolean>

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
	{ label, subLabel, signal, on, onChange, tooltip, disabled, ...props }: ToggleProps,
): JSX.Element {
	const value = signal !== undefined ? signal.value : on
	const setValue = (v: boolean) => {
		if (signal !== undefined) {
			signal.value = v
		} else {
			onChange?.(v)
		}
	}

	return (
		<div class={clsx("mb-2 flex", props.class)}>
			<label class="label text-wrap">
				<Tooltip text={tooltip}>
					<input
						class="toggle toggle-primary"
						type="checkbox"
						disabled={disabled}
						checked={value}
						onInput={(e) => !disabled && setValue(e.currentTarget.checked)}
					/>
				</Tooltip>
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
			</label>
		</div >
	)
}
