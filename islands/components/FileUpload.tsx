import { FileList, Section, Upload } from "components"
import { config } from "config"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { State } from "state"

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
			description={$("Files.Description", { size: "" + (config.storage.maxSize / 1000000) })}
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
