import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { JSX } from "preact"
import { BaseProps } from "./base.ts"

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
export function Upload(
	{ text = "Click to upload or drag and drop", multiple, onFileAdded, ...props }: UploadProps,
): JSX.Element {
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
			class={clsx("flex w-full items-center justify-center pb-2.5", props.class)}
			onDrop={dropHandler}
			onDragOver={(e) => e.preventDefault()}
		>
			<label
				for="dropzone-file"
				class="flex h-28 w-full flex-col cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:bg-base-200 dark:border-gray-600 dark:hover:border-gray-500"
			>
				<div class="flex flex-col items-center justify-center pt-5 pb-6">
					<CloudArrowUpIcon class="h-11 w-11 text-gray-500 dark:text-gray-400" />
					<p class="mb-2 text-gray-500 text-sm dark:text-gray-400">
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
