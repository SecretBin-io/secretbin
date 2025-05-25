import classNames from "classnames"
import { Button, Icon, Show } from "components"
import { downloadFile, humanReadableSize } from "helpers"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"

interface FileItemProps extends BaseProps {
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
function FileItem({ file, downloadable, onDelete, ...props }: FileItemProps): JSX.Element {
	return (
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
}

export interface FileListProps extends BaseProps {
	files: File[]
	downloadable?: boolean
	onDelete?: (f: File) => void
}

export function FileList({ files, downloadable, onDelete, ...props }: FileListProps): JSX.Element | undefined {
	if (files.length === 0) {
		return undefined
	}

	return (
		<div
			{...props}
			class={classNames(
				"bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg shadow dark:border-gray-700",
				props.class,
			)}
		>
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">
				{files.map((x, i) => (
					<>
						<Show if={i > 0}>
							<hr class="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
						</Show>
						<FileItem
							file={x}
							downloadable={downloadable}
							onDelete={onDelete ? () => onDelete(x) : undefined}
						/>
					</>
				))}
			</ul>
		</div>
	)
}
