import {
	ArrowDownCircleIcon,
	DocumentDuplicateIcon,
	EnvelopeIcon,
	LinkIcon,
	PlusIcon,
	QrCodeIcon,
	TrashIcon,
} from "@heroicons/react/24/outline"
import { qrcode } from "@libs/qrcode"
import { Button, Input, Modal, Section, Show, TextArea } from "components"
import { JSX } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { downloadDataURL, imageDataURL } from "utils/helpers"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"
import { MessagePreview, setMessagePreview } from "./preview.ts"

export interface ShareSecretProps {
	state: State
	id: string
}

export function ShareSecret({ id, state }: ShareSecretProps): JSX.Element {
	const [qrCode, setQrCode] = useState("")
	const [link, setLink] = useState("")
	const [preview, setPreview] = useState("")
	const $ = useTranslation(state.language, "ShareSecret")
	const modalRef = useRef<HTMLDialogElement | null>(null)
	const imgRef = useRef<HTMLImageElement | null>(null)

	const showQrCode = () => {
		const svg = qrcode(link, { output: "svg", ecl: "HIGH", border: 0 })
		setQrCode(`data:image/svg+xml;base64,${btoa(svg)}`)
		modalRef.current?.showModal()
	}

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
			<div class="dock relative my-3 bg-base-200">
				<Button
					label={$("Actions.New")}
					theme="dock"
					icon={PlusIcon}
					link="/"
				/>
				<Button
					label={$("Actions.Open")}
					theme="dock"
					icon={LinkIcon}
					link={link}
				/>
				<Button
					label={$("Actions.CopyLink")}
					theme="dock"
					icon={DocumentDuplicateIcon}
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
					theme="dock"
					icon={QrCodeIcon}
					onClick={showQrCode}
				/>
				<Button
					label={$("Actions.Email")}
					theme="dock"
					icon={EnvelopeIcon}
					onClick={sendEmail}
				/>
				<Button
					label={$("Actions.Delete")}
					theme="dock"
					icon={TrashIcon}
					link={`/secret/${id}/delete`}
				/>
			</div>
			<Modal
				dialogRef={modalRef}
				closable
				title="QR Code"
				actions={[
					{
						label: `${$("Actions.DownloadQR")} (.png)`,
						icon: ArrowDownCircleIcon,
						close: true,
						onClick: () => downloadDataURL(imageDataURL(imgRef!.current!), "qrcode.png"),
					},
					{
						label: `${$("Actions.DownloadQR")} (.svg)`,
						icon: ArrowDownCircleIcon,
						close: true,
						onClick: () => downloadDataURL(qrCode, "qrcode.svg"),
					},
				]}
			>
				<div class="flex items-center justify-center">
					<img class="border-10" ref={imgRef} width="256" src={qrCode} />
				</div>
			</Modal>
			<Show if={preview !== ""}>
				<Section title={$("Preview.Title")} description={$("Preview.Description")}>
					<TextArea readOnly lines={10} value={preview} />
				</Section>
			</Show>
		</>
	)
}
