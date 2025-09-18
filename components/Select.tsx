import { clsx } from "@nick/clsx"
import { Signal } from "@preact/signals"
import { VNode } from "preact"
import { JSX } from "preact/jsx-runtime"
import { BaseProps } from "./base.ts"

export interface SelectOptionProps {
	/** Option display name */
	name: string

	/** Option value */
	value: string
}

export function SelectOption({ name, value }: SelectOptionProps): JSX.Element {
	return <option key={name} value={value}>{name}</option>
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

	/** List of selectable options */
	children: VNode<SelectOptionProps>[]
}

/**
 * Creates an drop down field with defined selectable options
 */
export function Select({ signal, value, onChange, children, ...props }: SelectProps): JSX.Element {
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
			{children}
		</select>
	)
}
