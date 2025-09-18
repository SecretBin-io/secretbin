import { clsx } from "@nick/clsx"
import { JSX } from "preact"
import { jsx } from "preact/jsx-runtime"
import { BaseProps, SVGIcon } from "./base.ts"

/**
 * Button themes
 */
export type ButtonTheme = keyof typeof buttonThemes

const buttonThemes = {
	dock: "",
	clear: clsx("btn btn-ghost"),
	primary: clsx("btn btn-primary"),
	alternative: clsx("btn btn-neutral"),
	success: clsx("btn btn-success"),
	danger: clsx("btn btn-error"),
	warning: clsx("btn btn-warning"),
	info: clsx("btn btn-info"),
	plainPrimary: clsx("btn btn-outline btn-primary"),
	plainAlternative: clsx("btn btn-outline btn-secondary"),
	plainSuccess: clsx("btn btn-outline btn-success"),
	plainDanger: clsx("btn btn-error btn-outline"),
	plainWarning: clsx("btn btn-outline btn-warning"),
	plainInfo: clsx("btn btn-info btn-outline"),
}

export interface ButtonProps extends BaseProps {
	/** Text displayed on the button */
	label?: string

	/** Button style (Default: default) */
	theme?: ButtonTheme

	/** Optional button icon */
	icon?: SVGIcon

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

interface ButtonLabelProps extends BaseProps {
	/** Text displayed on the button */
	label?: string

	/** Optional button icon */
	icon?: SVGIcon

	/** Wether the button theme is dock */
	isDock?: boolean
}

function ButtonLabel({ label, icon, isDock }: ButtonLabelProps): JSX.Element {
	return (
		<>
			{icon
				? jsx(icon, {
					class: clsx("h-6 w-6", {
						"h-6 w-6": !isDock,
						"size-[1.2em]": isDock,
						"me-2": !!label && !isDock,
					}),
				})
				: null}
			<div class={clsx({ "dock-label": isDock })}>{label}</div>
		</>
	)
}

/**
 * Creates a clickable button
 */
export function Button(
	{
		label,
		icon,
		theme = "primary",
		type = "button",
		disabled,
		link,
		onClick,
		...props
	}: ButtonProps,
): JSX.Element {
	const classes = clsx(buttonThemes[theme], props.class)

	if (link) {
		return (
			<a class={classes} href={link}>
				<ButtonLabel label={label} icon={icon} isDock={theme === "dock"} />
			</a>
		)
	}

	return (
		<button
			type={type}
			disabled={disabled}
			class={classes}
			onClick={(e) => onClick?.(e)}
		>
			<ButtonLabel label={label} icon={icon} isDock={theme === "dock"} />
		</button>
	)
}
