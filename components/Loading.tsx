import { Spinner, SpinnerProps } from "components"
import { ComponentChildren } from "preact"

export interface LoadingProps extends SpinnerProps {
	/** While this condition is true, display a loading spinner instead of the children */
	while: boolean

	children: ComponentChildren
}

/**
 * Displays a spinner animation instead if children if condition is met.
 */
export const Loading = ({ while: _while, children, ...props }: LoadingProps) =>
	_while ? <Spinner {...props} /> : <>{children}</>
