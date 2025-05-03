import { Button, ButtonGroup, Input, QRCode, Section, Show, TextArea } from "components"
import { config } from "config"
import { useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { State } from "state"
import { MessagePreview, setMessagePreview } from "./preview.ts"

export interface ShareSecretProps {
	state: State
	id: string
}

export const ShareSecret = ({ id, state }: ShareSecretProps) => {
	const [showQrCode, setShowQrCode] = useState(false)
	const [link, setLink] = useState("")
	const [preview, setPreview] = useState("")
	const $ = useTranslationWithPrefix(state.lang, "ShareSecret")

	/**
	 * Opens a new mail with the secret link in the default mail application
	 */
	const sendEmail = () => {
		const subject = `${config.branding.appName}`
		const text = `${link}`
		globalThis.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
	}

	useEffect(() => {
		setPreview(MessagePreview)
		setMessagePreview("")
		// The link needs to be set here because the URL fragment (hash) is not sent to the server
		setLink(`${globalThis.location.origin}/secret/${id}${globalThis.location.hash}`)
	}, [])

	return (
		<>
			<Input readOnly autoPreselect={config.policy.sharePreselect} value={link} />
			<ButtonGroup class="py-3">
				<Button
					label={$("Actions.New")}
					icon="Plus"
					link="/"
				/>
				<Button
					label={$("Actions.Open")}
					icon="Link"
					link={link}
				/>
				<Button
					label={$("Actions.CopyLink")}
					icon="Copy"
					// onClick={() => navigator.clipboard.writeText(link)}
					onClick={() =>
						navigator.clipboard.write([
							new globalThis.ClipboardItem({
								"text/plain": Promise.resolve(link),
								"text/html": Promise.resolve(`<a href="${link}">${link}`),
							}),
						])}
				/>
				<Button
					label={$("Actions.GenerateQR")}
					icon="QRCode"
					onClick={() => setShowQrCode(true)}
				/>
				<Button
					label={$("Actions.Email")}
					icon="Mail"
					onClick={sendEmail}
				/>
				<Button
					label={$("Actions.Delete")}
					icon="Trash"
					link={`/secret/${id}/delete`}
				/>
			</ButtonGroup>
			<Show if={showQrCode}>
				<QRCode downloadLabel={$("Actions.DownloadQR")} content={link} />
			</Show>
			<Show if={preview !== ""}>
				<Section title={$("Preview.Title")} description={$("Preview.Description")}>
					<TextArea readOnly lines={10} value={preview} />
				</Section>
			</Show>
		</>
	)
}
