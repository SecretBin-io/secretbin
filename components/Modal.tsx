import { XMarkIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Button, ButtonProps, Show } from "components"
import { ComponentChild, ComponentChildren } from "preact"
import { MutableRef } from "preact/hooks"
import { BaseProps } from "./base.ts"

export interface Action extends ButtonProps {
	close?: boolean
}

export interface ModalProps extends BaseProps {
	/** Title of the modal dialog */
	title: string

	/** Optional smaller text below the title */
	description?: string

	/** Set of buttons which are rendered on the bottom of the model */
	actions: Action[]

	/** Function called when the modal is closed */
	onClose?: () => void

	/** Show an close icon at the top which allows the use to close the model without clicking on an action */
	closable?: boolean

	/** Reference to the dialog. Use it to show and close the modal */
	dialogRef?: MutableRef<HTMLDialogElement | null>

	/** Modal content */
	children: ComponentChildren
}

/**
 * Create a dismissible dialog in front of the page
 */
export function Modal(
	{ title, description, actions, dialogRef, closable, onClose, children, ...props }: ModalProps,
): ComponentChild {
	return (
		<dialog
			ref={dialogRef}
			class={clsx("modal", props.class)}>
			<div class="modal-box">
				<div class="flex items-center justify-between pb-4 md:pb-5 dark:border-gray-600">
					<h3 class="font-semibold text-gray-900 text-xl dark:text-white">
						<label class="font-medium text-gray-900 dark:text-gray-300">
							{title}
						</label>
						<Show if={description}>
							<p class="font-normal text-gray-500 text-xs dark:text-gray-400">
								{description}
							</p>
						</Show>
					</h3>
					<Show if={closable}>
						<Button
							icon={XMarkIcon}
							theme="dock"
							class="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 text-sm hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
							onClick={() => {
								dialogRef?.current?.close()
								onClose?.()
							}}
						/>
					</Show>
				</div>
				{children}
				<div class={clsx("modal-action", {
					"flex items-center justify-center": actions.length > 1
				})}>
					{actions.map(({ onClick, close, ...props }, i) => (
						<Button
							key={i}
							class={clsx({
								"mr-5": actions.length > 1,
								"float-right": actions.length === 1,
							})}
							onClick={close
								? (e) => {
									dialogRef?.current?.close()
									onClick?.(e)
								}
								: onClick}
							{...props}
						/>
					))}
				</div>
			</div>
		</dialog>
	)
}
