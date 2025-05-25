import classNames from "classnames"
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
			class={classNames(
				"cursor-pointer appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
				props.class,
			)}
			value={value}
			onInput={(e) => onChange?.(e.currentTarget.value)}
		>
			{children}
		</select>
	)
}
