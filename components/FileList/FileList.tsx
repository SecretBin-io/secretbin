import classNames from "classnames"
import { FileItem, Show } from "components"
import { BaseProps } from "../helpers.ts"

export interface FileListProps extends BaseProps {
	files: File[]
	downloadable?: boolean
	onDelete?: (f: File) => void
}

export const FileList = ({ files, downloadable, onDelete, ...props }: FileListProps) => (
	<Show if={files.length > 0}>
		<div
			{...props}
			class={classNames(
				"bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg shadow dark:border-gray-700",
				props.class,
			)}
		>
			<ul class="divide-y divide-gray-200 dark:divide-gray-700">
				{files.map((x) => (
					<FileItem
						file={x}
						downloadable={downloadable}
						onDelete={onDelete ? () => onDelete(x) : undefined}
					/>
				))}
			</ul>
		</div>
	</Show>
)
