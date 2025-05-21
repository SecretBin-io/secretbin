import { decodeBase64 } from "@std/encoding/base64"
import { Button, FileList, Input, Message, Section, Show, TextArea } from "components"
import { LocalizedError, useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { decryptSecret, getSecret } from "secret/client"
import { Secret, SecretData } from "secret/models"
import { State } from "state"

export interface ViewSecretProps {
	state: State
	id: string
	remainingReads: number
	passwordProtected: boolean
}

export const ViewSecret = ({ id, state, remainingReads, passwordProtected }: ViewSecretProps) => {
	const [requirePassword, setRequirePassword] = useState(passwordProtected)
	const [requireConfirm, setRequireConfirm] = useState(remainingReads !== -1)
	const [password, setPassword] = useState("")
	const [passwordInvalid, setPasswordInvalid] = useState(false)
	const [error, setError] = useState("")
	const [secret, setSecret] = useState<Secret | undefined>(undefined)
	const [secretData, setSecretData] = useState<SecretData | undefined>(undefined)

	const $ = useTranslationWithPrefix(state.language, "ViewSecret")

	useEffect(() => {
		if (requireConfirm || requirePassword) {
			return
		}

		read()
	}, [requireConfirm, requirePassword])

	const read = async () => {
		let sec: Secret | undefined = secret

		// If the secret hasn't been fetch yet, fetch it now
		if (!sec) {
			try {
				sec = await getSecret(id)
				setError("")
				setSecret(sec)
			} catch (err) {
				setError(LocalizedError.getLocalizedMessage(state.language, err as Error))
				console.log(err)
				sec = undefined
			}
		}

		// In case an error occurred do not process further
		if (!sec) {
			return
		}

		setRequirePassword(false)
		setError("")
		setPasswordInvalid(false)

		// Try to decrypt the secret
		try {
			const data = await decryptSecret(sec, password)
			setSecretData(data)
			return
		} catch (err) {
			// If decrypting using the password failed,
			// request a new password
			setPasswordInvalid(true)
			setRequirePassword(true)
			console.log(err)
			return
		}
	}

	return (
		<>
			<Show if={requireConfirm}>
				<p>{$("ReadConfirm")}</p>
				<br />
				<Button class="float-right" label={$("Read")} onClick={() => setRequireConfirm(false)} />
			</Show>
			<Show if={!requireConfirm && requirePassword}>
				<Section title={$("Password.Title")} description={$("Password.Description")}>
					<Input
						class="mb-2"
						password
						invalid={passwordInvalid}
						value={password}
						onChange={setPassword}
						onSubmit={() => setRequirePassword(false)}
					/>
					<Button class="float-right" label={$("Decrypt")} onClick={() => setRequirePassword(false)} />
					<Show if={passwordInvalid}>
						<p class="text-red-600 dark:text-red-500">
							{$("DecryptionError")}
						</p>
					</Show>
				</Section>
			</Show>
			<Message type="error" title="Error" message={error} />
			<Show if={!!secretData}>
				<TextArea class="resize-none" lines={15} readOnly value={secretData?.message} />
				<Show if={(secretData?.attachments ?? []).length !== 0}>
					<Section title={$("Files.Title")}>
						<FileList
							files={secretData?.attachments.map((att) =>
								new File([
									new Blob([decodeBase64(att.data).buffer], { type: att.contentType }),
								], att.name)
							) ?? []}
							downloadable
						/>
					</Section>
				</Show>
			</Show>
		</>
	)
}
