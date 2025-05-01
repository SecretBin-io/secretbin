import classNames from "classnames"
import { BaseProps, elementID } from "./helpers.ts"

export interface SelectOption {
	/** Option display name */
	name: string

	/** Option value */
	value: string
}

export interface SelectProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

	/** List of selectable options */
	options: SelectOption[]

	/** Current selected value */
	value?: string

	/**
	 * Function called when the selected values changes
	 * @param value Option value
	 */
	onChange?: (value: string) => void
}

/**
 * Creates an drop down field with defined selectable options
 */
export const Select = ({ id, options, value, onChange, ...props }: SelectProps) => (
	<select
		id={elementID("select", id)}
		style={props.style}
		class={classNames(
			"cursor-pointer appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
			props.class,
		)}
		value={value}
		onInput={(e) => onChange?.(e.currentTarget.value)}
	>
		{options.map(({ name, value }) => <option key={name} value={value}>{name}</option>)}
	</select>
)
