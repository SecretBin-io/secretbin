import Result from "@nihility-io/result"
import { Button, ButtonGroup, Icon, Input, Loading, Message, PageContent, QRCode, Show } from "components"
import { config } from "config"
import { Context } from "context"
import { useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { getSecretMetadata } from "secret/client"
import { LocalizedError } from "secret/models"

export interface ShareSecretProps {
	id: string
	ctx: Context
}

export const ShareSecret = ({ id, ctx }: ShareSecretProps) => {
	const [loading, setLoading] = useState(true)
	const [showQrCode, setShowQrCode] = useState(false)
	const [expires, setExpires] = useState<Date | undefined>(undefined)
	const [link, setLink] = useState("")
	const [error, setError] = useState("")
	const $ = useTranslationWithPrefix(ctx.lang, "ShareSecret")

	/**
	 * Opens a new mail with the secret link in the default mail application
	 */
	const sendEmail = () => {
		const subject = `${config.branding.appName}`
		const text = `${link}`
		window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
	}

	useEffect(() => {
		// The link needs to be set here because the URL fragment (hash) is not sent to the server
		setLink(`${window.location.origin}/secret/${id}${window.location.hash}`)
		getSecretMetadata(id).then(Result.match({
			success: (value) => setExpires(value.expires),
			failure: (err) => setError(LocalizedError.getLocalizedMessage(ctx.lang, err)),
		})).then(() => setLoading(false))
	}, [])

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<Loading while={loading}>
				<Show if={expires}>
					<p class="mb-5 text-base text-gray-500 dark:text-gray-400">
						{$("Expires")}: {expires?.toLocaleString()}
					</p>
				</Show>
				<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
					<div class="mx-auto">
						<Input readOnly autoPreselect={config.policy.sharePreselect} value={link} />
						<ButtonGroup class="py-3">
							<Button
								label={$("Actions.New")}
								svg={<Icon.PlusOutline />}
								link="/"
							/>
							<Button
								label={$("Actions.Open")}
								svg={<Icon.GlobeOutline />}
								link={link}
							/>
							<Button
								label={$("Actions.CopyLink")}
								svg={<Icon.FileCopySolid />}
								onClick={() => navigator.clipboard.writeText(link)}
							/>
							<Button
								label={$("Actions.GenerateQR")}
								svg={<Icon.CameraPhotoSolid />}
								onClick={() => setShowQrCode(true)}
							/>
							<Button
								label={$("Actions.Email")}
								svg={<Icon.EnvelopeSolid />}
								onClick={sendEmail}
							/>
							<Button
								label={$("Actions.Delete")}
								svg={<Icon.TrashBinSolid />}
								link={`/secret/${id}/delete`}
							/>
						</ButtonGroup>
					</div>
					<Show if={showQrCode}>
						<QRCode content={link} />
					</Show>
					<Show if={error !== ""}>
						<Message type="error" title="Error" message={error} />
					</Show>
				</div>
			</Loading>
		</PageContent>
	)
}
