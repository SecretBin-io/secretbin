import classNames from "classnames"
import { Button, ButtonProps, Show } from "components"
import { ComponentChildren, JSX } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { BaseProps } from "./base.ts"

export interface Action extends ButtonProps {}

export interface ModalProps extends BaseProps {
	/** Title of the modal dialog */
	title: string

	/** Set of buttons which are rendered on the bottom of the model */
	actions: Action[]

	/** Set the visibility state of the modal */
	show?: boolean

	/** Function called when the modal is closed */
	onClose?: () => void

	/** Clicking the background dismisses tha modal if `dismissible` is true  */
	dismissible?: boolean

	/** Modal content */
	children: ComponentChildren
}

/**
 * Create a dismissible dialog in front of the page
 */
export function Modal(
	{ title, actions, show, onClose: onClose, dismissible, children, ...props }: ModalProps,
): JSX.Element | undefined {
	const [hidden, setHidden] = useState(true)
	const backdropRef = useRef<HTMLDivElement | null>(null)

	/**
	 * Dismiss the modal when the user clicks on the backdrop and the `onDismiss` prop is set
	 */
	const onBackdropClicked = !onClose ? undefined : (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
		if (e.target === backdropRef.current) {
			onClose()
		}
	}

	// In order for the animation to work, we need to delay the effects of !show until the animation is done
	useEffect(() => {
		if (!show) {
			setTimeout(() => setHidden(true), 250)
		} else {
			setHidden(false)
		}
	}, [show])

	if (hidden) {
		return undefined
	}

	return (
		<div
			ref={backdropRef}
			style={props.style}
			tabindex={-1}
			aria-hidden="true"
			class={classNames(
				"overflow-y-auto overflow-x-hidden fixed justify-center items-center w-full max-h-full bg-gray-900/50 dark:bg-gray-900/80 inset-0 z-40 flex",
				props.class,
			)}
			onClick={dismissible ? onBackdropClicked : undefined}
		>
			<div
				class={classNames(
					"relative p-4 w-full max-w-2xl max-h-full",
					{
						"animate-appear": show,
						"animate-disappear": !show,
					},
				)}
			>
				<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
							{title}
						</h3>
						<Show if={onClose}>
							<Button
								icon="Close"
								overrideClass
								class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
								onClick={onClose}
							/>
						</Show>
					</div>
					<div class="p-4 md:p-5 space-y-4">
						{children}
					</div>
					<div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
						{actions.map((action, i) => <Button key={i} class="mr-5" {...action} />)}
					</div>
				</div>
			</div>
		</div>
	)
}
