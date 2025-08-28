import { JSX } from "preact"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

export interface TextAreaProps extends BaseProps {
	/** Enable the use of tabs inside the text area */
	tabs?: boolean

	/** Current text value */
	value?: string

	/** Number of initial lines */
	lines?: number

	/** Hint shown when no text is set */
	placeholder?: string

	/** Makes text area readonly */
	readOnly?: boolean

	/** Makes the text area resizable */
	resizable?: boolean

	/** Function called when the text changed */
	onChange?: (value: string) => void
}

/**
 * Run this function inside of `textarea.onKeyDown` in order to allow tabs to be used inside text areas.
 * By default pressing tab will not insert a tab but shift focus to the next input.
 * @param onChange Optional value change handler
 */
function enableTabs(onChange?: (value: string) => void): (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => void {
	return (e) => {
		// Only handle the tab key
		if (e.key !== "Tab") {
			return
		}

		// Prevent the default behavior of shifting focus to the next element
		e.preventDefault()

		// Get caret position
		const start = e.currentTarget.selectionStart
		const end = e.currentTarget.selectionEnd

		// Set textarea value to: text before caret + tab + text after caret
		onChange?.(
			e.currentTarget.value.substring(0, start) +
				"\t" + e.currentTarget.value.substring(end),
		)

		// Put caret at right position again
		e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1
	}
}

/**
 * Creates a text field
 */
export function TextArea(
	{ value, tabs, lines, placeholder, resizable, readOnly, onChange, ...props }: TextAreaProps,
): JSX.Element {
	return (
		<textarea
			style={props.style}
			class={clsx(
				"block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
				{
					"resize-none": !resizable,
				},
				props.class,
			)}
			value={value}
			placeholder={placeholder}
			rows={lines}
			readOnly={readOnly}
			onInput={(e) => onChange?.(e.currentTarget.value)}
			onKeyDown={tabs ? enableTabs(onChange) : undefined}
		/>
	)
}
