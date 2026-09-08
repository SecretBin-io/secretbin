import { TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "@nick/clsx"
import { decryptSecret, getSecret } from "client"
import { Button, FileList, Input, Message, Section, Spinner, TextArea } from "components"
import { Secret } from "models"
import { ComponentChild } from "preact"
import { useEffect, useState } from "preact/hooks"
import { LocalizedError } from "utils/errors"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface ViewSecretProps {
	state: State

	/**
	 * UUID identifying the secret.
	 */
	id: string

	/**
	 * Number of remain reads after which the secret is deleted.
	 */
	remainingReads: number

	/**
	 * Specifies if the data payload is additionally protected by a password.
	 * This is used to determine if the password prompt should be shown.
	 */
	passwordProtected: boolean
}

export function ViewSecret({ id, state, remainingReads, passwordProtected }: ViewSecretProps): ComponentChild {
	const [requirePassword, setRequirePassword] = useState(passwordProtected)
	const [requireConfirm, setRequireConfirm] = useState(remainingReads !== -1)
	const [password, setPassword] = useState("")
	const [passwordInvalid, setPasswordInvalid] = useState(false)
	const [error, setError] = useState("")
	const [secret, setSecret] = useState<Secret | undefined>(undefined)
	const [secretContent, setSecretContent] = useState<[string, File[]] | undefined>(undefined)
	const [loading, setLoading] = useState(false)
	const [showDelete, setShowDelete] = useState(false)

	const $ = useTranslation(state.language, "ViewSecret")

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
				setError(LocalizedError.getMessage(state.language, err as Error))
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
			setLoading(true)
			const data = await decryptSecret(sec, password.trim())
			setLoading(false)
			setSecretContent(data)
			setShowDelete(sec.remainingReads === 1)
			return
		} catch (err) {
			// If decrypting using the password failed,
			// request a new password
			setPasswordInvalid(true)
			setRequirePassword(true)
			// deno-lint-ignore no-console
			console.log(err)
			setLoading(false)
			return
		}
	}

	return (
		<>
			<Spinner label={$("Decrypting")} hidden={!loading} />
			<div class={clsx({ "hidden": loading })}>
				{requireConfirm && (
					<>
						<p>{$("ReadConfirm")}</p>
						<br />
						<Button class="float-right" label={$("Read")} onClick={() => setRequireConfirm(false)} />
					</>
				)}
				{(!requireConfirm && requirePassword) && (
					<Section title={$("Password.Title")} description={$("Password.Description")}>
						<Input
							class="mb-2"
							password
							invalid={passwordInvalid}
							value={password}
							onChange={setPassword}
							onSubmit={() =>
								setRequirePassword(false)}
						/>
						<Button
							class="float-right"
							label={$("Decrypt")}
							onClick={() =>
								setRequirePassword(false)}
						/>
						{passwordInvalid && (
							<p class="text-red-600 dark:text-red-500">
								{$("DecryptionError")}
							</p>
						)}
					</Section>
				)}
				<Message type="error" title="Error" message={error} />
				{!!secretContent && (
					<>
						<TextArea class="mb-2 resize-none" lines={15} readOnly value={secretContent?.[0]} />
						{!showDelete && (
							<Button
								class="float-right"
								label={$("Delete")}
								icon={TrashIcon}
								link={`/secret/${id}/delete`}
							/>
						)}
						{((secretContent?.[1] ?? []).length !== 0) && (
							<FileList
								title={$("Files.Title")}
								files={secretContent?.[1] ?? []}
								downloadable
							/>
						)}
					</>
				)}
			</div>
		</>
	)
}
