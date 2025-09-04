import { DocumentIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Button, Show } from "components"
import { JSX } from "preact"
import { downloadFile, humanReadableSize } from "utils/helpers"
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
			class={clsx("p-2.5 px-2.5", { "cursor-pointer": downloadable }, props.class)}
			onClick={downloadable ? () => downloadFile(file) : undefined}
		>
			<div class="flex items-center space-x-4 rtl:space-x-reverse">
				<div class="flex-shrink-0">
					<DocumentIcon className="h-6 w-6 text-gray-800 dark:text-white" />
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate font-medium text-gray-900 text-sm dark:text-white">
						{file.name}
					</p>
					<p class="truncate text-gray-500 text-sm dark:text-gray-400">
						{humanReadableSize(file.size)}
					</p>
				</div>
				<Show if={onDelete}>
					<div class="inline-flex items-center font-semibold text-base text-gray-900 dark:text-white">
						<Button theme="plainDanger" icon={TrashIcon} onClick={onDelete} />
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
			class={clsx(
				"rounded-lg border border-gray-200 bg-gray-50 shadow dark:border-gray-700 dark:bg-gray-700",
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
