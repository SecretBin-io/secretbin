import classNames from "classnames"
import { Icon, IconName } from "components"
import { JSX } from "preact"
import { BaseProps } from "./helpers.ts"

/**
 * Button themes
 */
export type ButtonTheme = "default" | "alternative" | "success" | "danger" | "warning" | "info"

const buttonThemes: Record<ButtonTheme, string> = {
	default:
		"text-white bg-blue-700 hover:bg-blue-800 focus:ring-blue-300 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800",
	alternative:
		"me-2 text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700",
	success:
		"text-white bg-green-700 hover:bg-green-800 focus:ring-green-300 me-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800",
	danger:
		"text-white bg-red-700 hover:bg-red-800 focus:ring-red-300 me-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900",
	warning: "text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-yellow-300 me-2 dark:focus:ring-yellow-900",
	info:
		"text-white bg-purple-700 hover:bg-purple-800 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900",
}

export interface ButtonProps extends BaseProps {
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

	/**
	 * Link which will be navigated to when button is press
	 * (Note: you can only set either `link` or `onSubmit` and not both)
	 */
	link?: string

	/** ID of the dropdown element if the button is a dropdown toggle */
	dropdown?: string

	/** Changes to button type to submit */
	submit?: boolean

	/**
	 * Function which will be called when button is press
	 * (Note: you can only set either `link` or `onSubmit` and not both)
	 */
	onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
}

/**
 * Creates a clickable button
 */
export const Button = (
	{ label, theme = "default", overrideClass, onClick, link, submit, dropdown, icon, ...props }: ButtonProps,
) => {
	const classes = overrideClass ? props.class : classNames(
		"focus:outline-none focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mb-2",
		buttonThemes[theme],
		props.class,
	)

	const Label = () => (
		<>
			{icon ? <Icon name={icon} class={classNames({ "w-4 h-4": !overrideClass, "me-2": label })} /> : <></>}
			{label ? label : <></>}
		</>
	)

	return (
		<>
			{link
				? (
					<a {...props} class={classes} href={link}>
						<Label />
					</a>
				)
				: (
					<button
						type={submit ? "submit" : undefined}
						style={props.style}
						disabled={props.disabled}
						class={classes}
						onClick={(e) => onClick?.(e)}
						{...(dropdown ? { "data-dropdown-toggle": dropdown } : {})}
					>
						<Label />
					</button>
				)}
		</>
	)
}
