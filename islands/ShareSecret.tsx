import {
	DocumentDuplicateIcon,
	EnvelopeIcon,
	LinkIcon,
	PlusIcon,
	QrCodeIcon,
	TrashIcon,
} from "@heroicons/react/24/outline"
import { Button, Input, QRCode, Section, Show, TextArea } from "components"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"
import { MessagePreview, setMessagePreview } from "./preview.ts"

export interface ShareSecretProps {
	state: State
	id: string
}

export function ShareSecret({ id, state }: ShareSecretProps): JSX.Element {
	const [showQrCode, setShowQrCode] = useState(false)
	const [link, setLink] = useState("")
	const [preview, setPreview] = useState("")
	const $ = useTranslation(state.language, "ShareSecret")

	/**
	 * Opens a new mail with the secret link in the default mail application
	 */
	const sendEmail = () => {
		const subject = `${state.config.branding.appName}`
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
			<Input readOnly autoPreselect value={link} />
			<div role="group" class="inline-flex rounded-md py-3">
				<Button
					label={$("Actions.New")}
					theme="alternative"
					icon={PlusIcon}
					groupPosition="first"
					link="/"
				/>
				<Button
					label={$("Actions.Open")}
					theme="alternative"
					icon={LinkIcon}
					groupPosition="middle"
					link={link}
				/>
				<Button
					label={$("Actions.CopyLink")}
					theme="alternative"
					icon={DocumentDuplicateIcon}
					groupPosition="middle"
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
					theme="alternative"
					icon={QrCodeIcon}
					groupPosition="middle"
					onClick={() => setShowQrCode(true)}
				/>
				<Button
					label={$("Actions.Email")}
					theme="alternative"
					icon={EnvelopeIcon}
					groupPosition="middle"
					onClick={sendEmail}
				/>
				<Button
					label={$("Actions.Delete")}
					theme="alternative"
					icon={TrashIcon}
					groupPosition="last"
					link={`/secret/${id}/delete`}
				/>
			</div>
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
