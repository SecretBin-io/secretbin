import { FileList, Section, Upload } from "components"
import { JSX } from "preact"
import { humanReadableSize } from "utils/helpers"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface FileUploadProps {
	state: State
	files: File[]
	setFiles: (files: File[]) => void
}

export function FilesUpload({ state, files, setFiles }: FileUploadProps): JSX.Element {
	const $ = useTranslation(state.language, "NewSecret")

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
