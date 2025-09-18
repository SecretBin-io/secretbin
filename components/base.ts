import { AnyComponent, JSX } from "preact"

export interface BaseProps {
	/** Class for the root element of the component */
	class?: string
}

export type SVGIcon = AnyComponent<JSX.IntrinsicElements["svg"]>
