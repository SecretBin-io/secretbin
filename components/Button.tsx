import { clsx } from "@nick/clsx"
import { Icon, IconName } from "components"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"

/**
 * Button themes
 */
export type ButtonTheme = keyof typeof buttonThemes

const buttonThemes = {
	clear: clsx("text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"),
	default: clsx(
		"bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-800",
	),
	alternative: clsx(
		"border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
	),
	success: clsx(
		"bg-green-700 text-white hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:text-white dark:hover:bg-green-700 dark:focus:ring-green-800",
	),
	danger: clsx(
		"bg-red-700 text-white hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 dark:focus:ring-red-900",
	),
	warning: clsx(
		"bg-yellow-400 text-white hover:bg-yellow-500 focus:ring-yellow-300 dark:bg-yellow-400 dark:text-white dark:hover:bg-yellow-500 dark:focus:ring-yellow-900",
	),
	info: clsx(
		"bg-purple-700 text-white hover:bg-purple-800 focus:ring-purple-300 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 dark:focus:ring-purple-900",
	),
	plainDefault: clsx(
		"border border-transparent text-blue-700 hover:border hover:border-blue-800 focus:ring-blue-300 dark:text-blue-600 dark:hover:border-blue-700 dark:focus:ring-blue-800",
	),
	plainAlternative: clsx(
		"bg-white text-gray-900 hover:bg-gray-100 focus:ring-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700",
	),
	plainSuccess: clsx(
		"border border-transparent text-green-700 hover:border-green-800 focus:ring-green-300 dark:text-green-600 dark:hover:border-green-700 dark:focus:ring-green-800",
	),
	plainDanger: clsx(
		"border border-transparent text-red-700 hover:border-red-800 focus:ring-red-300 dark:text-red-600 dark:hover:border-red-700 dark:focus:ring-red-900",
	),
	plainWarning: clsx(
		"border border-transparent text-yellow-400 hover:border-yellow-500 focus:ring-yellow-300 dark:text-yellow-400 dark:hover:border-yellow-500 dark:focus:ring-yellow-900",
	),
	plainInfo: clsx(
		"border border-transparent text-purple-700 hover:border-purple-800 focus:ring-purple-300 dark:text-purple-600 dark:hover:border-purple-700 dark:focus:ring-purple-900",
	),
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

	/** Specify the button type (default: button) */
	type?: "button" | "submit" | "reset"

	/**
	 * Function which will be called when button is press
	 * (Note: you can only set either `link` or `onSubmit` and not both)
	 */
	onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void
}

/**
 * Creates a clickable button
 */
export function Button(
	{ label, icon, theme = "default", type = "button", disabled, overrideClass, link, onClick, ...props }: ButtonProps,
): JSX.Element {
	const classes = overrideClass ? props.class : clsx(
		"me-2 mb-2 inline-flex items-center rounded-lg px-2.5 py-2.5 font-medium text-sm focus:outline-none focus:ring-4",
		buttonThemes[theme],
		{
			"pointer-events-none cursor-not-allowed opacity-50": disabled,
		},
		props.class,
	)

	const Label = () => (
		<>
			{icon ? <Icon name={icon} class={clsx("h-6 w-6", { "me-2": !!label })} /> : null}
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
						type={type}
						style={props.style}
						disabled={disabled}
						class={classes}
						onClick={(e) => onClick?.(e)}
					>
						<Label />
					</button>
				)}
		</>
	)
}
