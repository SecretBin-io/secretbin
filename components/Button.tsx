import { clsx } from "@nick/clsx"
import { ComponentChild, ComponentChildren, TargetedMouseEvent } from "preact"
import { jsx } from "preact/jsx-runtime"
import { BaseProps, SVGIcon } from "./base.ts"

export interface ButtonProps extends BaseProps {
	/** Text displayed on the button */
	label?: string

	/** Button style (Default: default) */
	theme?: "clear" | "primary" | "neutral" | "success" | "error" | "warning" | "info" | "dock"

	/** Makes the button clear */
	outline?: boolean

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
	onClick?: (e: TargetedMouseEvent<HTMLButtonElement>) => void

	children?: ComponentChildren
}

interface ButtonLabelProps extends Pick<ButtonProps, "label" | "icon" | "children"> {
	/** Wether the button theme is dock */
	isDock?: boolean
}

function ButtonLabel({ label, icon, isDock, children }: ButtonLabelProps): ComponentChild {
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
			{label ? <div class={clsx({ "dock-label": isDock })}>{label}</div> : null}
			{children}
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
		outline,
		type = "button",
		disabled,
		link,
		onClick,
		children,
		...props
	}: ButtonProps,
): ComponentChild {
	const classes = clsx({
		"btn": theme !== "dock",
		"btn-ghost": theme === "clear",
		"btn-primary": theme === "primary",
		"btn-neutral": theme === "neutral",
		"btn-success": theme === "success",
		"btn-error": theme === "error",
		"btn-warning": theme === "warning",
		"btn-info": theme === "info",
		"btn-outline": outline,
	}, props.class)

	if (link) {
		return (
			<a class={classes} href={link}>
				<ButtonLabel label={label} icon={icon} isDock={theme === "dock"} >
					{children}
				</ButtonLabel>
			</a>
		)
	}

	return (
		<button
			class={classes}
			type={type}
			disabled={disabled}
			onClick={(e) => onClick?.(e)}
		>
			<ButtonLabel label={label} icon={icon} isDock={theme === "dock"} >
				{children}
			</ButtonLabel>
		</button>
	)
}
