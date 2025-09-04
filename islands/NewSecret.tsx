import { KeyIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { submitSecret } from "client"
import { Button, Message, Spinner, TextArea } from "components"
import { PasswordGenerator } from "islands"
import { JSX } from "preact"
import { useRef, useState } from "preact/hooks"
import { LocalizedError, SecretSizeLimitError } from "utils/errors"
import { useSetting, useTranslation } from "utils/hooks"
import { State } from "../utils/state.ts"
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
	const [expires, setExpires] = useSetting("options.expires", state.config.defaults.expires, state)
	const [burn, setBurn] = useSetting(
		"options.burn",
		state.config.policy.requireBurn ? true : state.config.defaults.burn,
		state,
	)
	const [slowBurn, setSlowBurn] = useSetting("options.slowBurn", false, state)
	const [rereads, setRereads] = useSetting("options.rereads", 2, state)
	const [error, setError] = useState("")
	const [showGenerator, setShowGenerator] = useState(false)
	const [loading, setLoading] = useState(false)
	const aRef = useRef<HTMLAnchorElement | null>(null)
	const $ = useTranslation(state.language, "NewSecret")

	const submit = async () => {
		if (password === undefined) {
			return
		}

		setMessagePreview(message)

		// Submit the secret to the backend
		try {
			setLoading(true)
			const size = files.reduce((acc, x) => acc + x.size, 0) + message.length
			if (size >= state.config.storage.maxSize) {
				throw new SecretSizeLimitError(size, state.config.storage.maxSize)
			}

			const res = await submitSecret(
				message,
				files,
				password,
				{ expires, burn, slowBurn, rereads },
				state.config.policy.encryptionAlgorithm,
			)
			setError("")
			aRef.current!.href = res
			aRef.current!.click()
		} catch (err) {
			setLoading(false)
			setError(LocalizedError.getMessage(state.language, err as Error))
		}
	}

	return (
		<>
			<Spinner label={$("Encrypting")} hidden={!loading} />
			<div class={clsx({ "hidden": loading })}>
				<TextArea tabs lines={10} resizable placeholder="" value={message} onChange={setMessage} />
				<Button
					label={$("Options.GeneratePassword")}
					icon={KeyIcon}
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
			</div>
			{/* This line is necessary in order to use Deno Fresh Partials. Partials only work when navigating using links. */}
			<a class="hidden" ref={aRef} href="" />
		</>
	)
}
