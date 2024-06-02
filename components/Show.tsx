import { ComponentChildren } from "preact"

export interface ShowProps {
	/** Condition which determines if the content is shown. This can be a boolean or any other value that can be truthy */
	"if": unknown

	/** Children to render if the condition is truthy */
	children: ComponentChildren
}

/**
 * Element that only renders its children if the `if` condition is meet
 */
export const Show = (props: ShowProps) => props.if ? <>{props.children}</> : <></>
