import classNames from "classnames"
import { Icon } from "components"
import { JSX } from "preact"
import { BaseProps } from "./helpers.ts"

export type MessageType = "error"

const colorMessageType: Record<MessageType, string> = {
	error:
		"text-red-800 border-red-300 border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800",
}

const iconMessageType: Record<MessageType, () => JSX.Element> = {
	error: () => <Icon.ExclamationCircleSolid />,
}

export interface MessageProps extends BaseProps {
	/** Message type */
	title: string

	/** Type of messages, which determines the style */
	type: MessageType

	/** Message text */
	message: string
}

/**
 * Creates a message with a title wrapped in a colored box
 */
export const Message = ({ title, type, message, ...props }: MessageProps) => {
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
			{iconMessageType[type]()}
			<span class="sr-only">{title}</span>
			<div class="pl-2">
				<span class="font-medium">{title}:</span> {message}
			</div>
		</div>
	)
}
