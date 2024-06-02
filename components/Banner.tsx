import classNames from "classnames"
import { Icon } from "components"
import { BaseProps, elementID } from "./helpers.ts"

export interface BannerProps extends BaseProps {
	/** Element ID (Default: Random ID) */
	id?: string

	/** Title of the banner */
	title: string

	/** Message text of the banner */
	message: string

	/** Places the banner on the top of the page */
	top?: boolean

	/** Places the banner on the bottom of the page */
	bottom?: boolean
}

/**
 * Creates a disposable message at the top or bottom of the page
 */
export const Banner = ({ id, title, message, top, bottom, ...props }: BannerProps) => {
	const elemId = elementID("banner", id)
	return (
		<div
			id={elemId}
			tabindex={-1}
			style={props.style}
			class={classNames(
				"fixed bg-white border border-gray-100 dark:bg-gray-700 dark:border-gray-600",
				{
					"z-50 flex flex-col md:flex-row justify-between w-[calc(100%-2rem)] p-4 -translate-x-1/2 rounded-lg shadow-sm lg:max-w-7xl left-1/2 top-6":
						top,
					"bottom-0 start-0 z-50 flex justify-between w-full p-4 border-t": bottom,
				},
				props.class,
			)}
		>
			<div class="flex flex-col items-start mb-3 me-4 md:items-center md:flex-row md:mb-0">
				<div class="flex items-center mb-2 border-gray-200 md:pe-4 md:me-4 md:border-e md:mb-0 dark:border-gray-600">
					<span class="self-center text-lg font-semibold whitespace-nowrap dark:text-white">
						{title}
					</span>
				</div>
				<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">
					{message}
				</p>
			</div>
			<div class="flex items-center flex-shrink-0">
				<button
					data-dismiss-target={`#${elemId}`}
					type="button"
					class="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
				>
					<Icon.CloseOutline class="w-7 h-7" />
				</button>
			</div>
		</div>
	)
}
