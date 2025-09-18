import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Show, SVGIcon } from "components"
import { ComponentChildren, JSX } from "preact"
import { jsx } from "preact/jsx-runtime"
import { BaseProps } from "./base.ts"

export type MessageType = "error" | "warning" | "info"

const colorMessageType: Record<MessageType, string> = {
	info: clsx("alert-info"),
	warning: clsx("alert-warning"),
	error: clsx("alert-error"),
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
		<div role="alert" class={clsx("alert alert-soft", colorMessageType[type], props.class)}>
			{jsx(iconMessageType[type], { class: clsx("h-6 w-6") })}
			<Show if={title}>
				<span class="font-medium">{title}</span>
				{" "}
			</Show>
			<span class={clsx({ "text-base": largeText })}>{children ?? message}</span>
		</div>
	)
}
