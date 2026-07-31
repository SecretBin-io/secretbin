import { CloudArrowUpIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { ComponentChild, TargetedDragEvent, TargetedInputEvent } from "preact"
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
	onFileAdded: (f: File[]) => void
}

/**
 * Creates a file drop zone where files can be dragged and dropped or added using a click
 */
export function Upload(
	{ text = "Click to upload or drag and drop", multiple, onFileAdded, ...props }: UploadProps,
): ComponentChild {
	const clickHandler = (ev: TargetedInputEvent<HTMLInputElement>) => {
		const files: File[] = []

		Array.from(ev.currentTarget.files ?? []).forEach((item) => {
			files.push(item)
		})

		if (files.length > 0) {
			onFileAdded(files)
		}
	}

	const dropHandler = async (ev: TargetedDragEvent<HTMLDivElement>) => {
		ev.stopPropagation()
		ev.preventDefault()

		const files: File[] = []

		if (ev.dataTransfer?.items) {
			for await (const item of ev.dataTransfer.items) {
				if (item.kind === "file" && (item.getAsEntry?.() ?? item.webkitGetAsEntry())?.isDirectory !== true) {
					const file = item.getAsFile()
					if (file) {
						files.push(file)
					}
				}
			}
		} else {
			// Fallback
			for (const item of ev.dataTransfer?.files ?? []) {
				files.push(item)
			}
		}

		if (files.length > 0) {
			onFileAdded(files)
		}
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
					onInput={clickHandler}
				/>
			</label>
		</div>
	)
}
