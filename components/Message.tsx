import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Show, SVGIcon } from "components"
import { ComponentChildren, JSX } from "preact"
import { jsx } from "preact/jsx-runtime"
import { BaseProps } from "./base.ts"

export type MessageType = "error" | "warning" | "info"

const colorMessageType: Record<MessageType, string> = {
	info: clsx(
		"border-grey-300 bg-grey-50 text-grey-800 dark:border-grey-800 dark:bg-gray-800 dark:text-grey-400",
	),
	warning: clsx(
		"border-yellow-900 bg-yellow-50 text-yellow-800 dark:border-yellow-400 dark:bg-gray-800 dark:text-yellow-400",
	),
	error: clsx(
		"border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-gray-800 dark:text-red-400",
	),
}

const iconMessageType: Record<MessageType, SVGIcon> = {
	info: InformationCircleIcon,
	warning: ExclamationTriangleIcon,
	error: XCircleIcon,
}

export interface MessageProps extends BaseProps {
	/** Message title (default: Message) */
	title?: string

	/** Type of messages, which determines the style (default: info) */
	type?: MessageType

	/** Message text (Note: If neither message nor children is set, the message box will not be rendered) */
	message?: string

	/** Makes the text larger */
	largeText?: boolean

	children?: ComponentChildren
}

/**
 * Creates a message with a title wrapped in a colored box
 */
export function Message(
	{ title, type = "info", largeText, children, message, ...props }: MessageProps,
): JSX.Element | undefined {
	if (!message && !children) {
		return undefined
	}

	return (
		<div
			style={props.style}
			class={clsx(
				"mb-4 flex items-center rounded-lg border p-4 text-sm",
				colorMessageType[type],
				props.class,
			)}
			role="alert"
		>
			{jsx(iconMessageType[type], { class: clsx("h-6 w-6") })}
			<div class="pl-2">
				<Show if={title}>
					<span class="font-medium">{title}:</span>
					{" "}
				</Show>
				<span class={clsx({ "text-base": largeText })}>
					{children ?? message}
				</span>
			</div>
		</div>
	)
}
