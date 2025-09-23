import { KeyIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { submitSecret } from "client"
import { Button, Message, Section, Spinner, TextArea } from "components"
import { PasswordGenerator } from "islands"
import { ComponentChild } from "preact"
import { useRef, useState } from "preact/hooks"
import { LocalizedError, SecretSizeLimitError } from "utils/errors"
import { useSettingSignal, useTranslation } from "utils/hooks"
import { State } from "utils/state"
import { FilesUpload } from "./components/FileUpload.tsx"
import { Options } from "./components/Options.tsx"
import { setMessagePreview } from "./preview.ts"

export interface NewSecretProps {
	state: State
}

export function NewSecret({ state }: NewSecretProps): ComponentChild {
	const [message, setMessage] = useState("")
	const [files, setFiles] = useState<File[]>([])
	const [password, setPassword] = useState<string | undefined>("")
	const expires = useSettingSignal("options.expires", state.config.defaults.expires, state)
	const burn = useSettingSignal(
		"options.burn",
		state.config.policy.requireBurn ? true : state.config.defaults.burn,
		state,
	)
	const slowBurn = useSettingSignal("options.slowBurn", false, state)
	const rereads = useSettingSignal("options.rereads", 2, state)
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const aRef = useRef<HTMLAnchorElement | null>(null)
	const dialogRef = useRef<HTMLDialogElement | null>(null)

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
				{ expires: expires.value, burn: burn.value, slowBurn: slowBurn.value, rereads: rereads.value },
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
				<Section
					title={$("Message.Title")}
					description={$("Message.Description")}
				>
					<TextArea tabs lines={10} resizable placeholder="" value={message} onChange={setMessage} />
					<div class="-mb-8 w-full text-right">
						<Button
							class="mt-2"
							label={$("Options.GeneratePassword")}
							icon={KeyIcon}
							theme="primary"
							outline
							onClick={() => dialogRef.current?.show()}
						/>
					</div>
				</Section>
				<PasswordGenerator
					state={state}
					dialogRef={dialogRef}
					onPassword={(x) => {
						setMessage(message + x)
						dialogRef.current?.showModal()
					}}
					onDismiss={() => dialogRef.current?.close()}
				/>
				<FilesUpload state={state} files={files} setFiles={setFiles} />
				<Options
					state={state}
					expires={expires}
					burn={burn}
					slowBurn={slowBurn}
					rereads={rereads}
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
