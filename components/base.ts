import { AnyComponent, JSX } from "preact"

export interface BaseProps {
	/** Element ID for the root element of the component */
	id?: string

	/** Class for the root element of the component */
	class?: string

	/** Style for the root element of the component */
	style?: JSX.CSSProperties
}

export type SVGIcon = AnyComponent<JSX.IntrinsicElements["svg"]>
