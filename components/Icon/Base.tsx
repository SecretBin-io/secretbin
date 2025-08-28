import type { ComponentChildren, JSX } from "preact"

export interface SVGProps extends Omit<JSX.IntrinsicElements["svg"], "name"> {}

export interface SVGIconProps extends SVGProps {}

export type SVGIcon = (props: SVGIconProps) => JSX.Element

export interface BaseProps extends SVGProps {
	solid?: boolean
	children: ComponentChildren
}

export function Base({ solid, children, ...rest }: BaseProps): JSX.Element {
	return (
		<svg
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill={solid ? "currentColor" : "none"}
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-6 w-6"
			{...rest}
		>
			{children}
		</svg>
	)
}
