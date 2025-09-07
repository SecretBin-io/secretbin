import { XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
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

	// Dismiss the modal when the user clicks on the backdrop and the `onDismiss` prop is set
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
			class={clsx(
				"fixed inset-0 z-40 flex max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 dark:bg-gray-900/80",
				props.class,
			)}
			onClick={dismissible ? onBackdropClicked : undefined}
		>
			<div
				class={clsx(
					"relative max-h-full w-full max-w-2xl p-4",
					{
						"animate-appear": show,
						"animate-disappear": !show,
					},
				)}
			>
				<div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
					<div class="flex items-center justify-between rounded-t border-b p-4 md:p-5 dark:border-gray-600">
						<h3 class="font-semibold text-gray-900 text-xl dark:text-white">
							{title}
						</h3>
						<Show if={onClose}>
							<Button
								icon={XMarkIcon}
								overrideClass
								class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 text-sm hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
								onClick={onClose}
							/>
						</Show>
					</div>
					<div class="space-y-4 p-4 md:p-5">
						{children}
					</div>
					<div class="flex items-center rounded-b border-gray-200 border-t p-4 md:p-5 dark:border-gray-600">
						{actions.map((action, i) => <Button key={i} class="mr-5" {...action} />)}
					</div>
				</div>
			</div>
		</div>
	)
}
