import { ComponentChild, ComponentChildren } from "preact"

export interface ShowProps {
	/** Condition which determines if the content is shown. This can be a boolean or any other value that can be truthy */
	"if": unknown

	/** Children to render if the condition is truthy */
	children: ComponentChildren
}

/**
 * Element that only renders its children if the `if` condition is meet
 */
export function Show(props: ShowProps): ComponentChild {
	if (!props.if) {
		return undefined
	}
	return props.children
}
