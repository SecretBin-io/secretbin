import { FileList, Section, Upload } from "components"
import { humanReadableSize } from "helpers"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { State } from "utils/state"

export interface FileUploadProps {
	state: State
	files: File[]
	setFiles: (files: File[]) => void
}

export function FilesUpload({ state, files, setFiles }: FileUploadProps): JSX.Element {
	const $ = useTranslationWithPrefix(state.language, "NewSecret")

	return (
		<Section
			title={$("Files.Title")}
			description={$("Files.Description", { size: humanReadableSize(state.config.storage.maxSize, true) })}
		>
			<Upload
				multiple
				text={$("Files.DragAndDrop")}
				onFileAdded={(x) => setFiles([...files, x])}
			/>
			<FileList files={files} onDelete={(x) => setFiles(files.filter((y) => y !== x))} />
		</Section>
	)
}
