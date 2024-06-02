import classNames from "classnames"
import { Button, ButtonTheme } from "components"
import { Modal as FlowbiteModal, ModalInterface } from "flowbite"
import { ComponentChildren } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { BaseProps, elementID } from "./helpers.ts"

export interface Action {
	/** Name displayed on the button */
	name: string

	/** Button theme (Default: default) */
	theme?: ButtonTheme

	/**
	 * Function called when the button is clicked.
	 * @param modal Instance of the modal, which can be used to e.g. close it
	 */
	onClick: (modal: ModalInterface) => void
}

export interface ModalProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

	/** Title of the modal dialog */
	title: string

	/** Set of buttons which are rendered on the bottom of the model */
	actions: Action[]

	/** Function used to give the parent access to the model interface in order to e.g. close the dialog */
	modelRef?: (modal: ModalInterface) => void

	/** Modal content */
	children: ComponentChildren
}

/**
 * Create a dismissible dialog in front of the page
 */
export const Modal = ({ id, title, actions, modelRef, children, ...props }: ModalProps) => {
	const [modal, setModal] = useState<ModalInterface | undefined>(undefined)
	const modalRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!modalRef.current) {
			return
		}

		// Create a modal instance using flowbite
		const m: ModalInterface = new FlowbiteModal(modalRef.current, {
			placement: "bottom-right",
			backdrop: "static",
			backdropClasses: "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40",
			closable: true,
		}, {
			id: elementID("modal", id),
			override: true,
		})

		setModal(m)

		// Send the model instance to the parent
		modelRef?.(m)
	}, [])

	return (
		<div
			style={props.style}
			ref={modalRef}
			tabindex={-1}
			aria-hidden="true"
			class={classNames(
				"hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full",
				props.class,
			)}
		>
			<div class="relative p-4 w-full max-w-2xl max-h-full">
				<div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
						<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
							{title}
						</h3>
					</div>
					<div class="p-4 md:p-5 space-y-4">
						{children}
					</div>
					<div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
						{actions.map((action) => (
							<Button
								class="mr-5"
								theme={action.theme}
								label={action.name}
								onClick={() => action.onClick(modal!)}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
