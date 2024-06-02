import classNames from "classnames"
import { useEffect, useState } from "preact/hooks"
// @deno-types="npm:@types/qrcode@1.5.5"
import qr from "qrcode"
import { BaseProps } from "./helpers.ts"

export interface QRCodeProps extends BaseProps {
	/** QRCode content */
	content: string
}

/**
 * Generates a QRCode and displays it as an image
 */
export const QRCode = ({ content, ...props }: QRCodeProps) => {
	const [qrCode, setQrCode] = useState("")

	useEffect(() => {
		qr.toDataURL(content)
			.then(setQrCode)
	}, [content])

	return (
		<div style={props.style} class={classNames("flex items-center justify-center py-10", props.class)}>
			<img width={256} src={qrCode} />
		</div>
	)
}
