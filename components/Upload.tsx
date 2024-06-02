import classNames from "classnames"
import { Icon } from "components"
import { JSX } from "preact"
import { BaseProps } from "./helpers.ts"

export interface UploadProps extends BaseProps {
	/** Display text inside the upload box */
	text?: string

	/** Allow uploading multiple files */
	multiple?: boolean

	/**
	 * Function called when a file was added
	 * @param f File that was added
	 */
	onFileAdded: (f: File) => void
}

/**
 * Creates a file drop zone where files can be dragged and dropped or added using a click
 */
export const Upload = ({ text = "Click to upload or drag and drop", multiple, onFileAdded, ...props }: UploadProps) => {
	const dropHandler = (ev: JSX.TargetedDragEvent<HTMLDivElement>) => {
		ev.preventDefault()

		Array.from(ev.dataTransfer?.items ?? []).forEach((item) => {
			if (item.kind === "file") {
				const file = item.getAsFile()
				if (file) {
					onFileAdded(file)
				}
			}
		})

		Array.from(ev.dataTransfer?.files ?? []).forEach(onFileAdded)
	}

	return (
		<div
			style={props.style}
			class={classNames("flex items-center justify-center w-full pb-2.5", props.class)}
			onDrop={dropHandler}
			onDragOver={(e) => e.preventDefault()}
		>
			<label
				for="dropzone-file"
				class="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
			>
				<div class="flex flex-col items-center justify-center pt-5 pb-6">
					<Icon.CloudArrowUpOutline class="w-11 h-11 text-gray-500 dark:text-gray-400" />
					<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
						<span class="font-semibold">{text}</span>
					</p>
				</div>
				<input
					id="dropzone-file"
					type="file"
					class="hidden"
					multiple={multiple}
					onInput={(x) => Array.from(x.currentTarget.files ?? []).forEach(onFileAdded)}
				/>
			</label>
		</div>
	)
}
