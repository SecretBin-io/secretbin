import classNames from "classnames"
import { Icon, IconName } from "components"
import { BaseProps } from "./helpers.ts"

export type MessageType = "error" | "warning" | "info"

const colorMessageType: Record<MessageType, string> = {
	info:
		"text-grey-800 border-grey-300 border-grey-300 bg-grey-50 dark:bg-gray-800 dark:text-grey-400 dark:border-grey-800",
	warning:
		"text-yellow-800 border-yellow-900 border-yellow-900 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400 dark:border-yellow-400",
	error:
		"text-red-800 border-red-300 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
}

const iconMessageType: Record<MessageType, IconName> = {
	info: "Info",
	warning: "Exclamation",
	error: "Error",
}

export interface MessageProps extends BaseProps {
	/** Message title (default: Message) */
	title?: string

	/** Type of messages, which determines the style (default: info) */
	type?: MessageType

	/** Message text (Note: If no message is set, the message box will not be rendered) */
	message?: string
}

/**
 * Creates a message with a title wrapped in a colored box
 */
export const Message = ({ title = "Message", type = "info", message, ...props }: MessageProps) => {
	if (!message) {
		return undefined
	}

	return (
		<div
			style={props.style}
			class={classNames(
				"flex items-center p-4 mb-4 text-sm border rounded-lg",
				colorMessageType[type],
				props.class,
			)}
			role="alert"
		>
			<Icon name={iconMessageType[type]} />
			<div class="pl-2">
				<span class="font-medium">{title}:</span> {message}
			</div>
		</div>
	)
}
