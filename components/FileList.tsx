import { DocumentIcon, TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { Button } from "components"
import { ComponentChild } from "preact"
import { downloadFile, humanReadableSize } from "utils/helpers"
import { BaseProps } from "./base.ts"

export interface FileListProps extends BaseProps {
	/**
	 * Optional title displayed above the file list
	 */
	title?: string

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
export function FileList({ title, files, downloadable, onDelete, ...props }: FileListProps): ComponentChild {
	if (files.length === 0) {
		return undefined
	}

	return (
		<div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
			<ul class={clsx("list rounded-box bg-base-100 shadow-md", props.class)}>
				<li class="p-4 pb-2 text-xs tracking-wide opacity-60">{title}</li>
				{files.map((file) => (
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
						<Button
							class="btn-error btn-square size-[1.2em] cursor-pointer"
							theme="dock"
							icon={TrashIcon}
							onClick={onDelete ? () => onDelete(file) : undefined}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
