import classNames from "classnames"
import { JSX } from "preact"
import { BaseProps, elementID } from "./helpers.ts"

export interface TextAreaProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

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
const enableTabs = (onChange?: (value: string) => void) => (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
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

/**
 * Creates a text field
 */
export const TextArea = (
	{ id, value, tabs, lines, placeholder, resizable, readOnly, onChange, ...props }: TextAreaProps,
) => (
	<textarea
		id={elementID("text", id)}
		style={props.style}
		class={classNames(
			"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
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
