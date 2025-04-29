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
			{
				/* <div class="flex flex-col items-start mb-3 me-4 md:items-center md:flex-row md:mb-0">
				<div class="flex items-center mb-2 border-gray-200 md:pe-4 md:me-4 md:border-e md:mb-0 dark:border-gray-600">
					<span class="self-center text-lg font-semibold whitespace-nowrap dark:text-white">
						{iconMessageType[type]()}
						<span class="sr-only">{title}</span>
					</span>
				</div>
				<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
					{message}
				</p>
			</div> */
			}
			<Icon name={iconMessageType[type]} />
			<span class="sr-only">{title}</span>
			<div class="pl-2">
				<span class="font-medium">{title}:</span> {message}
			</div>
		</div>
	)
}
