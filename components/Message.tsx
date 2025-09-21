import { ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Show } from "components"
import { ComponentChild, ComponentChildren } from "preact"
import { BaseProps } from "./base.ts"

export interface MessageProps extends BaseProps {
	/** Message title (default: Message) */
	title?: string

	/** Type of messages, which determines the style (default: info) */
	type?: "error" | "warning" | "info"

	/** Message text (Note: If neither message nor children is set, the message box will not be rendered) */
	message?: string

	/** Makes the text larger */
	largeText?: boolean

	children?: ComponentChildren
}

/**
 * Returns the appropriate icon for the message type
 */
function MessageIcon({ type }: Pick<MessageProps, "type">): ComponentChild {
	switch (type) {
		case "info":
			return <InformationCircleIcon class="h-6 w-6" />
		case "warning":
			return <ExclamationTriangleIcon class="h-6 w-6" />
		case "error":
			return <XCircleIcon class="h-6 w-6" />
	}
}

/**
 * Creates a message with a title wrapped in a colored box
 */
export function Message({ title, type = "info", largeText, children, message, ...props }: MessageProps): ComponentChild {
	if (!message && !children) {
		return undefined
	}

	return (
		<div role="alert" class={clsx("alert alert-soft", {
			"alert-info": type === "info",
			"alert-warning": type === "warning",
			"alert-error": type === "error",
		}, props.class)}>
			<MessageIcon type={type} />
			<div>
				<Show if={title}>
					<h3 class="font-bold">{title}</h3>
				</Show>
				<span class={clsx({ "text-base": largeText })}>{children ?? message}</span>
			</div>
		</div>
	)
}
