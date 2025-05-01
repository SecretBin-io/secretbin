import classNames from "classnames"
import { Button, ButtonTheme, IconName } from "components"
import { useEffect, useState } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { BaseProps } from "./helpers.ts"

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

	/** Add CSS classes to the dropdown */
	dropdownClass?: string

	/** Dropdown items */
	items?: DropdownItem[]
}

export interface DropdownItem extends BaseProps {
	/** Text displayed on the item */
	label: string

	/** Optional item icon */
	icon?: IconName

	/** Makes item non-clickable */
	disabled?: boolean

	/**
	 * Link which will be navigated to when button is press
	 * (Note: you can only set either `link` or `onSubmit` and not both)
	 */
	link?: string

	/**
	 * Function which will be called when button is press
	 * (Note: you can only set either `link` or `onSubmit` and not both)
	 */
	onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
}

/**
 * Creates a drop down button which displays a list of items when clicked
 */
export const Dropdown = ({ dropdownClass, items, ...rest }: DropdownProps) => {
	const [show, setShow] = useState(false)
	const [hidden, setHidden] = useState(true)

	// In order for the animation to work, we need to delay the effects of !show until the animation is done
	useEffect(() => {
		if (!show) {
			setTimeout(() => setHidden(true), 250)
		} else {
			setHidden(false)
		}
	}, [show])

	return (
		<div className="relative">
			<Button theme="clear" onClick={() => setShow(!show)} {...rest} />

			<div
				class={classNames(
					"absolute my-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700",
					dropdownClass,
					{
						"animate-appear": show,
						"animate-disappear": !show,
						"hidden": hidden,
					},
				)}
			>
				<ul class="py-2 font-medium" role="none">
					{items?.map(({ onClick, ...rest }) => (
						<li>
							<Button
								overrideClass
								class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white w-full"
								onClick={(e) => {
									onClick?.(e)
									setShow(false)
								}}
								{...rest}
							/>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
