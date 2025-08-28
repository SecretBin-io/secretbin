import { clsx } from "@nick/clsx"
import { JSX } from "preact"
import { useEffect, useRef } from "preact/hooks"
import { BaseProps } from "./base.ts"

export interface InputProps extends BaseProps {
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
export function Input(
	{
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
): JSX.Element {
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
			ref={ref}
			style={props.style}
			class={clsx(
				"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
				{
					"border-red-500 dark:border-red-500": invalid,
					"border-green-500": valid,
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
