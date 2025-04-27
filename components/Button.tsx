import classNames from "classnames"
import { Icon, IconName } from "components"
import { JSX } from "preact"
import { BaseProps } from "./helpers.ts"

/**
 * Button themes
 */
export type ButtonTheme = keyof typeof buttonThemes

const buttonThemes = {
	clear: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white",
	default:
		"text-white dark:text-white bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800",
	alternative:
		"text-gray-900 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-100 dark:focus:ring-gray-700 border border-gray-200 dark:border-gray-600",
	success:
		"text-white dark:text-white bg-green-700 dark:bg-green-600 hover:bg-green-800 dark:hover:bg-green-700 focus:ring-green-300 dark:focus:ring-green-800",
	danger:
		"text-white dark:text-white bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-700 focus:ring-red-300 dark:focus:ring-red-900",
	warning:
		"text-white dark:text-white bg-yellow-400 dark:bg-yellow-400 hover:bg-yellow-500 dark:hover:bg-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-900",
	info:
		"text-white dark:text-white bg-purple-700 dark:bg-purple-600 hover:bg-purple-800 dark:hover:bg-purple-700 focus:ring-purple-300 dark:focus:ring-purple-900",
	plainDefault:
		"text-blue-700 dark:text-blue-600 border border-transparent hover:border hover:border-blue-800 dark:hover:border-blue-700 focus:ring-blue-300 dark:focus:ring-blue-800",
	plainAlternative:
		"text-gray-900 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-100 dark:focus:ring-gray-700",
	plainSuccess:
		"text-green-700 dark:text-green-600 border border-transparent hover:border-green-800 dark:hover:border-green-700 focus:ring-green-300 dark:focus:ring-green-800",
	plainDanger:
		"text-red-700 dark:text-red-600 border border-transparent hover:border-red-800 dark:hover:border-red-700 focus:ring-red-300 dark:focus:ring-red-900",
	plainWarning:
		"text-yellow-400 dark:text-yellow-400 border border-transparent hover:border-yellow-500 dark:hover:border-yellow-500 focus:ring-yellow-300 dark:focus:ring-yellow-900",
	plainInfo:
		"text-purple-700 dark:text-purple-600 border border-transparent hover:border-purple-800 dark:hover:border-purple-700 focus:ring-purple-300 dark:focus:ring-purple-900",
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
		"inline-flex items-center focus:outline-none focus:ring-4 font-medium rounded-lg text-sm px-2.5 py-2.5 mb-2 me-2",
		buttonThemes[theme],
		props.class,
	)

	const Label = () => (
		<>
			{icon ? <Icon name={icon} class={classNames("w-6 h-6", { "me-2": !!label })} /> : null}
			{label}
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
						type={submit ? "submit" : "button"}
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
