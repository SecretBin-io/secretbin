import { clsx } from "@nick/clsx";
import { Signal } from "@preact/signals";
import { ComponentChild } from "preact";
import { BaseProps } from "./base.ts";

export interface SelectOption {
	/**
	 * Option label as displayed to the user
	 */
	label: string

	/**
	 * Option value as used in the code
	 */
	value: string
}

export interface SelectProps extends BaseProps {
	/** Signal that stores the state. Can be used instead of value and onChange */
	signal?: Signal<string>

	/** Current selected value */
	value?: string

	/**
	 * Function called when the selected values changes
	 * @param value Option value
	 */
	onChange?: (value: string) => void

	/**
	 * Map of selectable options (key = option value, value = option display name)
	 */
	options: SelectOption[]
}

/**
 * Creates an drop down field with defined selectable options
 */
export function Select({ signal, value, onChange, options, ...props }: SelectProps): ComponentChild {
	const val = signal !== undefined ? signal.value : value
	const setVal = (v: string) => {
		if (signal !== undefined) {
			signal.value = v
		} else {
			onChange?.(v)
		}
	}

	return (
		<select
			class={clsx("select w-full", props.class)}
			value={val}
			onInput={(e) => setVal(e.currentTarget.value)}
		>
			{options.map(({ label, value }) => (
				<option key={value} value={value}>{label}</option>
			))}
		</select>
	)
}
