import classNames from "classnames"
import { Button, Icon, Show } from "components"
import { humanReadableSize } from "helpers"
import { BaseProps } from "../helpers.ts"
import { downloadFile } from "./helpers.ts"

export interface FileItemProps extends BaseProps {
	/** Wrapped file object */
	file: File

	/** Makes the file downloadable by clicking on it  */
	downloadable?: boolean

	/** Enable the delete icon next to the file if this function is set. Clicking on the icon calls this function  */
	onDelete?: () => void
}

/**
 * File list entry which represents a file
 */
export const FileItem = ({ file, downloadable, onDelete, ...props }: FileItemProps) => (
	<li
		{...props}
		class={classNames("p-2.5 px-2.5", { "cursor-pointer": downloadable }, props.class)}
		onClick={downloadable ? () => downloadFile(file) : undefined}
	>
		<div class="flex items-center space-x-4 rtl:space-x-reverse">
			<div class="flex-shrink-0">
				<Icon name="Document" className="w-6 h-6 text-gray-800 dark:text-white" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
					{file.name}
				</p>
				<p class="text-sm text-gray-500 truncate dark:text-gray-400">
					{humanReadableSize(file.size)}
				</p>
			</div>
			<Show if={onDelete}>
				<div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
					<Button theme="plainDanger" icon="Trash" onClick={onDelete} />
				</div>
			</Show>
		</div>
	</li>
)
