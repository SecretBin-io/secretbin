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

	/**
	 * Enable the delete icon next to the file if this
	 * function is set. Clicking on the icon calls this function
	 */
	onDelete?: () => void
}

/**
 * File list entry which represents a file
 */
function FileItem({ file, downloadable, onDelete }: FileItemProps): JSX.Element {
	return (
		<li
			class={clsx("list-row", { "cursor-pointer": downloadable })}
			onClick={downloadable ? () => downloadFile(file) : undefined}>
			<div>
				<DocumentIcon className="size-10" />
			</div>
			<div>
				<div>{file.name}</div>
				<div class="font-semibold text-xs uppercase opacity-60">{humanReadableSize(file.size)}</div>
			</div>
			<Button class="btn-error btn-square size-[1.2em] cursor-pointer" theme="dock" icon={TrashIcon} onClick={onDelete} />
		</li>
	)
}

export interface FileListProps extends BaseProps {
	/**
	 * List of files to show in the list view
	 */
	files: File[]

	/**
	 * Makes each file in the list clickable.
	 * Clicking on a file initiates a download
	 */
	downloadable?: boolean

	/**
	 * Enable the delete icon next to the file if this
	 * function is set. Clicking on the icon calls this function
	 */
	onDelete?: (f: File) => void
}

/**
 * List of files
 */
export function FileList({ files, downloadable, onDelete, ...props }: FileListProps): JSX.Element | undefined {
	if (files.length === 0) {
		return undefined
	}

	return (
		<>
			<ul class={clsx("list rounded-box bg-base-100 shadow-md", props.class)}>
				<li class="p-4 pb-2 text-xs tracking-wide opacity-60">File List</li>
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
		</>
	)
}
