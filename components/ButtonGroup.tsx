import { clsx } from "@nick/clsx"
import { ButtonProps } from "components"
import { cloneElement, JSX, VNode } from "preact"
import { BaseProps } from "./base.ts"

export interface ButtonGroupProps extends BaseProps {
	children: VNode<ButtonProps>[]
}

/**
 * Creates a group of buttons which are combined into a single component
 */
export function ButtonGroup({ children, ...props }: ButtonGroupProps): JSX.Element {
	return (
		<div
			style={props.style}
			class={clsx("inline-flex rounded-md", props.class)}
			role="group"
		>
			{children.map((b, i) =>
				cloneElement(b, {
					...b,
					overrideClass: true,
					class: clsx(
						"inline-flex items-center border border-gray-200 bg-white px-4 py-2 font-medium text-gray-900 text-sm hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:focus:text-white dark:focus:ring-blue-500",
						{
							"rounded-s-lg": i === 0,
							"rounded-e-lg": i === children.length - 1,
						},
					),
				})
			)}
		</div>
	)
}
