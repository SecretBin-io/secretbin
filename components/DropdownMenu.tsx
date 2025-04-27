import { Button, ButtonTheme, IconName } from "components"
import { BaseProps } from "./helpers.ts"
import { JSX } from "preact/jsx-runtime"
import { Dropdown } from "./Dropdown.tsx"

export interface DropdownMenuProps extends BaseProps {
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

	/** Dropdown items */
	items?: DropdownMenuItem[]
}

export interface DropdownMenuItem extends BaseProps {
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
export const DropdownMenu = ({ items, ...rest }: DropdownMenuProps) => {
	return (
		<Dropdown {...rest}>
			<ul class="py-2 font-medium" role="none">
				{items?.map((x) => (
					<li>
						<Button
							overrideClass
							class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
							{...x}
						/>
					</li>
				))}
			</ul>
		</Dropdown>
	)
}
