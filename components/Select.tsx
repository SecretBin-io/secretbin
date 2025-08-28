import { VNode } from "preact"
import { JSX } from "preact/jsx-runtime"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

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
export function Select({ value, onChange, children, ...props }: SelectProps): JSX.Element {
	return (
		<select
			style={props.style}
			class={clsx(
				"block w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
				props.class,
			)}
			value={value}
			onInput={(e) => onChange?.(e.currentTarget.value)}
		>
			{children}
		</select>
	)
}
