import Result from "@nihility-io/result"
import { decodeBase64 } from "@std/encoding/base64"
import { Button, FileList, Input, Loading, Message, PageContent, Section, Show, TextArea } from "components"
import { Context } from "context"
import { useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { decryptSecret, getSecret, getSecretMetadata } from "secret/client"
import { LocalizedError, Secret, SecretData } from "secret/models"

export interface ViewSecretProps {
	id: string
	ctx: Context
}

export const ViewSecret = ({ id, ctx }: ViewSecretProps) => {
	const [loading, setLoading] = useState(true)
	const [requirePassword, setRequirePassword] = useState(false)
	const [requireConfirm, setRequireConfirm] = useState(false)
	const [password, setPassword] = useState("")
	const [passwordInvalid, setPasswordInvalid] = useState(false)
	const [error, setError] = useState("")
	const [secret, setSecret] = useState<Secret | undefined>(undefined)
	const [secretData, setSecretData] = useState<SecretData | undefined>(undefined)

	const $ = useTranslationWithPrefix(ctx.lang, "ViewSecret")

	const onConfirm = () => {
		setRequireConfirm(false)
		if (!requirePassword) {
			read(password)
		}
	}

	const onPassword = (pass: string) => {
		setPassword(pass)
		read(pass)
	}

	useEffect(() => {
		// Request the secret preview (metadata without the secret data)
		getSecretMetadata(id).then(Result.match({
			success: (value) => {
				// If the secret doesn't burn and has no password, decrypt it
				if (value.remainingReads === -1 && !value.passwordProtected) {
					read(password)
				} else {
					// Show read confirmation and/or password prompt
					setRequireConfirm(value.remainingReads !== -1)
					setRequirePassword(value.passwordProtected)
				}
			},
			failure: (err) => {
				setError(LocalizedError.getLocalizedMessage(ctx.lang, err))
				console.log(err)
			},
		})).then(() => setLoading(false))
	}, [])

	const read = async (password: string) => {
		let sec: Secret | undefined = secret

		// If the secret hasn't been fetch yet, fetch it now
		if (!sec) {
			sec = (await getSecret(id)).match({
				success: (value) => {
					setError("")
					setSecret(value)
					return value
				},
				failure: (err): Secret | undefined => {
					setError(LocalizedError.getLocalizedMessage(ctx.lang, err))
					console.log(err)
					return undefined
				},
			})
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
		<PageContent title={$("Title")} description={$("Description")}>
			<Loading while={loading}>
				<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
					<div class="mx-auto">
						<Show if={requireConfirm}>
							<p>{$("ReadConfirm")}</p>
							<br />
							<Button class="float-right" label={$("Read")} onClick={onConfirm} />
						</Show>
						<Show if={!requireConfirm && requirePassword}>
							<Section title={$("Password.Title")} description={$("Password.Description")}>
								<Input
									class="mb-2"
									hidden
									invalid={passwordInvalid}
									value={password}
									onChange={setPassword}
									onSubmit={(e) => onPassword(e)}
								/>
								<Button class="float-right" label={$("Decrypt")} onClick={() => onPassword(password)} />
								<Show if={passwordInvalid}>
									<p class="text-red-600 dark:text-red-500">
										{$("DecryptionError")}
									</p>
								</Show>
							</Section>
						</Show>
						<Show if={error !== ""}>
							<Message type="error" title="Error" message={error} />
						</Show>
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
					</div>
				</div>
			</Loading>
		</PageContent>
	)
}
