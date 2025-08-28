import { Button, ButtonTheme, IconName } from "components"
import { cloneElement, VNode } from "preact"
import { useEffect, useState } from "preact/hooks"
import { JSX } from "preact/jsx-runtime"
import { BaseProps } from "./base.ts"
import { clsx } from "@nick/clsx"

export interface DropdownItemProps extends BaseProps {
	/** Text displayed on the item */
	label: string

	/** Optional item icon */
	icon?: IconName

	/** Makes item non-clickable */
	disabled?: boolean

	/**
	 * Function which will be called when item is press
	 */
	onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void

	/**
	 * (Internal): Dismiss modal when clicked
	 */
	onDismiss?: () => void
}

/**
 * Creates an button which goes inside a dropdown
 */
export function DropdownItem({ label, icon, disabled, onClick, onDismiss }: DropdownItemProps): JSX.Element {
	return (
		<li>
			<Button
				overrideClass
				class="block w-full px-4 py-2 text-gray-700 text-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
				label={label}
				icon={icon}
				disabled={disabled}
				onClick={(e) => {
					onClick?.(e)
					onDismiss!()
				}}
			/>
		</li>
	)
}

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
	children: VNode<DropdownItemProps>[]
}

/**
 * Creates a dropdown button which displays a list of items when clicked
 */
export function Dropdown({ dropdownClass, children, ...rest }: DropdownProps): JSX.Element {
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
				class={clsx(
					"absolute my-2 list-none divide-y divide-gray-100 rounded-lg bg-white text-base shadow dark:bg-gray-700",
					dropdownClass,
					{
						"animate-appear": show,
						"animate-disappear": !show,
						"hidden": hidden,
					},
				)}
			>
				<ul class="py-2 font-medium" role="none">
					{children?.map((b) => cloneElement(b, { ...b, onDismiss: () => setShow(false) }))}
				</ul>
			</div>
		</div>
	)
}
