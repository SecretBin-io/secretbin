import { Button, ButtonTheme, IconName } from "components"
import { useEffect, useRef } from "preact/hooks"
import { BaseProps, elementID } from "./helpers.ts"
import { ComponentChildren } from "preact"

export interface DropdownProps extends BaseProps {
	/** Text displayed on the button */
	label?: string

	/** Button style (Default: default) */
	theme?: ButtonTheme

	/** Optional button icon */
	icon?: IconName

	/**
	 * Overrides button styling (cannot be used with `theme`)
	 */
	overrideClass?: boolean

	/** Makes button non-clickable */
	disabled?: boolean

	children?: ComponentChildren
}

/**
 * Creates a drop down button which displays child elements when clicked
 */
export const Dropdown = ({ children, ...rest }: DropdownProps) => {
	const id = elementID("dropdown")
	const targetRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		// This is necessary since my primary web browser, Safari, is weird and didn't load Flowbite correctly
		import("flowbite").then(({ initDropdowns }) => initDropdowns())
	}, [])

	return (
		<>
			<Button theme="clear" dropdown={id} {...rest} />

			<div
				ref={targetRef}
				id={id}
				class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
			>
				{children}
			</div>
		</>
	)
}
