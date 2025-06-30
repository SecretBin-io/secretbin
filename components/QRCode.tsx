import { qrcode } from "@libs/qrcode"
import classNames from "classnames"
import { Button } from "components"
import { downloadDataURL, imageDataURL } from "helpers"
import { JSX } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { BaseProps } from "./base.ts"

export interface QRCodeProps extends BaseProps {
	/** QRCode content */
	content: string

	/** Label shown on the download button */
	downloadLabel?: string

	/** QRCode size */
	size?: number
}

/**
 * Generates a QRCode and displays it as an image
 */
export function QRCode({ content, size = 256, downloadLabel = "Download", ...props }: QRCodeProps): JSX.Element {
	const [qrCode, setQrCode] = useState("")
	const imgRef = useRef<HTMLImageElement | null>(null)

	useEffect(() => {
		const svg = qrcode(content, { output: "svg", ecl: "HIGH", border: 0 })
		setQrCode(`data:image/svg+xml;base64,${btoa(svg)}`)
	}, [content])

	const downloadPNG = () => {
		downloadDataURL(imageDataURL(imgRef!.current!), "qrcode.png")
	}

	const downloadSVG = () => {
		downloadDataURL(qrCode, "qrcode.svg")
	}

	return (
		<>
			<div style={props.style} class={classNames("flex items-center justify-center pt-10 pb-5", props.class)}>
				<img class="border-10" ref={imgRef} width={size} src={qrCode} />
			</div>
			<div style={props.style} class={classNames("flex items-center justify-center", props.class)}>
				<Button
					theme="plainAlternative"
					icon="Download"
					label={`${downloadLabel} (.png)`}
					onClick={downloadPNG}
				/>
				<Button
					theme="plainAlternative"
					icon="Download"
					label={`${downloadLabel} (.svg)`}
					onClick={downloadSVG}
				/>
			</div>
		</>
	)
}
