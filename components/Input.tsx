import classNames from "classnames"
import { useEffect, useRef } from "preact/hooks"
import { BaseProps, elementID } from "./helpers.ts"

export interface InputProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

	/** Hides input text for e.g. passwords */
	password?: boolean

	/** Makes input text readonly */
	readOnly?: boolean

	/** Disables the input field */
	disabled?: boolean

	/** Markes input with a green border, signalizing the user that in input is valid */
	valid?: boolean

	/** Markes input with a red border, signalizing the user that in input is invalid */
	invalid?: boolean

	/** Hint shown when no text is set */
	placeholder?: string

	/** Focus and select text of this field upon loading */
	autoPreselect?: boolean

	/** Current text value */
	value?: string

	/** Function called when the input value changes */
	onChange?: (value: string) => void

	/** Function called enter is pressed */
	onSubmit?: (value: string) => void
}

/**
 * Creates a text input field
 */
export const Input = (
	{
		id,
		password,
		readOnly,
		value,
		disabled,
		invalid,
		valid,
		placeholder,
		autoPreselect,
		onChange,
		onSubmit,
		...props
	}: InputProps,
) => {
	const ref = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (autoPreselect) {
			if (!ref.current) {
				return
			}

			ref.current.focus()
			setTimeout(() => {
				if (!ref.current) {
					return
				}
				ref.current.select()
			}, 0)
		}
	}, [])
	return (
		<input
			id={elementID("input", id)}
			ref={ref}
			style={props.style}
			class={classNames(
				"block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
				{
					"border-red-500 dark:border-red-500": invalid,
					"border-green-500 dark:border-green-500": valid,
				},
				props.class,
			)}
			type={password ? "password" : "text"}
			readOnly={readOnly}
			value={value}
			placeholder={placeholder}
			disabled={disabled}
			onInput={(e) => onChange?.(e.currentTarget.value)}
			onKeyDown={(e) => e.key === "Enter" && onSubmit?.(e.currentTarget.value)}
		/>
	)
}
