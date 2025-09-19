import { clsx } from "@nick/clsx"
import { Signal } from "@preact/signals"
import { ComponentChild, TargetedKeyboardEvent } from "preact"
import { BaseProps } from "./base.ts"

export interface TextAreaProps extends BaseProps {
	/** Signal that stores the state. Can be used instead of value and onChange */
	signal?: Signal<string>

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
function enableTabs(onChange?: (value: string) => void): (e: TargetedKeyboardEvent<HTMLTextAreaElement>) => void {
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
	{ signal, value, tabs, lines, placeholder, resizable, readOnly, onChange, ...props }: TextAreaProps,
): ComponentChild {
	const val = signal !== undefined ? signal.value : value
	const setVal = (v: string) => {
		if (signal !== undefined) {
			signal.value = v
		} else {
			onChange?.(v)
		}
	}

	return (
		<textarea
			class={clsx(
				"textarea w-full",
				{
					"resize-none": !resizable,
				},
				props.class,
			)}
			value={val}
			placeholder={placeholder}
			rows={lines}
			readOnly={readOnly}
			onInput={(e) => setVal(e.currentTarget.value)}
			onKeyDown={tabs ? enableTabs(setVal) : undefined}
		/>
	)
}
