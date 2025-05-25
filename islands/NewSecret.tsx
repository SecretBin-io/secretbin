import { Button, Message, TextArea } from "components"
import { config } from "config"
import { useSetting } from "helpers"
import { PasswordGenerator } from "islands"
import { LocalizedError, useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { useRef, useState } from "preact/hooks"
import { submitSecret } from "secret/client"
import { State } from "state"
import { FilesUpload } from "./components/FileUpload.tsx"
import { Options } from "./components/Options.tsx"
import { setMessagePreview } from "./preview.ts"

export interface NewSecretProps {
	state: State
}

export function NewSecret({ state }: NewSecretProps): JSX.Element {
	const [message, setMessage] = useState("")
	const [files, setFiles] = useState<File[]>([])
	const [password, setPassword] = useState<string | undefined>("")
	const [expires, setExpires] = useSetting("options.expires", config.defaults.expires, state)
	const [burn, setBurn] = useSetting("options.burn", config.policy.requireBurn ? true : config.defaults.burn, state)
	const [slowBurn, setSlowBurn] = useSetting("options.slowBurn", false, state)
	const [rereads, setRereads] = useSetting("options.rereads", 2, state)
	const [error, setError] = useState("")
	const [showGenerator, setShowGenerator] = useState(false)
	const aRef = useRef<HTMLAnchorElement | null>(null)
	const $ = useTranslationWithPrefix(state.language, "NewSecret")

	const submit = async () => {
		if (password === undefined) {
			return
		}

		setMessagePreview(message)

		// Submit the secret to the backend
		try {
			const res = await submitSecret(message, files, password, { expires, burn, slowBurn, rereads })
			setError("")
			aRef.current!.href = res
			aRef.current!.click()
		} catch (e) {
			setError(LocalizedError.getMessage(state.language, e as Error))
		}
	}

	return (
		<>
			<TextArea tabs lines={10} resizable placeholder="" value={message} onChange={setMessage} />
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
			<Options
				state={state}
				expires={expires}
				setExpires={setExpires}
				burn={burn}
				setBurn={setBurn}
				slowBurn={slowBurn}
				setSlowBurn={setSlowBurn}
				rereads={rereads}
				setRereads={setRereads}
				setPassword={setPassword}
			/>
			<Message type="error" title="Error" message={error} />
			<Button class="float-right" label={$("Create")} onClick={submit} />
			{/* This line is necessary in order to use Deno Fresh Partials. Partials only work when navigating using links. */}
			<a class="hidden" ref={aRef} href="" />
		</>
	)
}
