import Result from "@nihility-io/result"
import { Button, Message, Show, TextArea } from "components"
import { config } from "config"
import { PasswordGenerator } from "islands"
import { useTranslationWithPrefix } from "lang"
import { useRef, useState } from "preact/hooks"
import { SecretOptions, submitSecret } from "secret/client"
import { LocalizedError } from "secret/models"
import { State } from "state"
import { FilesUpload } from "./components/FileUpload.tsx"
import { Options } from "./components/Options.tsx"
import { setMessagePreview } from "./preview.ts"

export interface NewSecretProps {
	state: State
}

export const NewSecret = ({ state }: NewSecretProps) => {
	const [message, setMessage] = useState("")
	const [files, setFiles] = useState<File[]>([])
	const [password, setPassword] = useState<string | undefined>("")
	const [options, setOptions] = useState<SecretOptions>({
		expires: config.defaults.expires,
		burn: config.policy.requireBurn ? true : config.defaults.burn,
		slowBurn: false,
		rereads: 2,
	})
	const [error, setError] = useState("")
	const [showGenerator, setShowGenerator] = useState(false)
	const aRef = useRef<HTMLAnchorElement | null>(null)

	const $ = useTranslationWithPrefix(state.lang, "NewSecret")

	const submit = async () => {
		if (password === undefined) {
			return
		}

		setMessagePreview(message)

		// Submit the secret to the backend
		await submitSecret(message, files, password, options).then(Result.match({
			success: (value) => {
				// If successful automatically redirect to the share page
				setError("")
				aRef.current!.href = value
				aRef.current!.click()
			},
			failure: (err) => setError(LocalizedError.getLocalizedMessage(state.lang, err)),
		}))
	}

	return (
		<>
			<TextArea id="note" tabs lines={10} resizable placeholder="" value={message} onChange={setMessage} />
			<Button
				label={$("Options.GeneratePassword")}
				icon="Key"
				theme="plainAlternative"
				class="mt-2"
				onClick={() => setShowGenerator(true)}
			/>
			<PasswordGenerator
				state={state}
				show={showGenerator}
				onPassword={(x) => {
					setMessage(message + x)
					setShowGenerator(false)
				}}
				onDismiss={() => setShowGenerator(false)}
			/>
			<br />
			<FilesUpload state={state} files={files} setFiles={setFiles} />
			<Options state={state} options={options} setOptions={setOptions} setPassword={setPassword} />
			<Message type="error" title="Error" message={error} />
			<Button class="float-right" label={$("Create")} onClick={submit} />
			{/* This line is necessary in order to use Deno Fresh Partials. Partials only work when navigating using links. */}
			<a class="hidden" ref={aRef} href="" />
		</>
	)
}
