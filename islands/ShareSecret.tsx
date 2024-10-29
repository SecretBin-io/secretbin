import { Button, ButtonGroup, Icon, Input, QRCode, Show } from "components"
import { config } from "config"
import { useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { State } from "state"

export interface ShareSecretProps {
	state: State
	id: string
}

export const ShareSecret = ({ id, state }: ShareSecretProps) => {
	const [showQrCode, setShowQrCode] = useState(false)
	const [link, setLink] = useState("")
	const $ = useTranslationWithPrefix(state.lang, "ShareSecret")

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
					icon="Internet"
					link={link}
				/>
				<Button
					label={$("Actions.CopyLink")}
					icon="File"
					// onClick={() => navigator.clipboard.writeText(link)}
					onClick={() =>
						navigator.clipboard.write([
							new ClipboardItem({
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
				<QRCode content={link} />
			</Show>
		</>
	)
}
