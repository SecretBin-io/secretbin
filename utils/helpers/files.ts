/**
 * Converts a HTML image into a PNG image data URL
 * @param img Image to convert
 * @returns Image data URL
 */
export function imageDataURL(img: HTMLImageElement): string {
	const canvas = globalThis.document.createElement("canvas")
	canvas.width = img.width
	canvas.height = img.width
	canvas.getContext("2d")?.drawImage(img, 0, 0, img.width, img.width)

	return canvas.toDataURL(`image/png`, 1.0)
}

/**
 * Downloads a given data URL as a file in the browser
 * @param url Data URL to download
 * @param filename Filename to use for the download
 */
export function downloadDataURL(url: string, filename: string): void {
	// In order to download a file with JavaScript, we need to create
	// an anchor element with the blob link and programmatically
	// click it
	const link = globalThis.document.createElement("a")
	link.style.display = "none"

	// Disable Deno Fresh partials for this link, otherwise we'll get
	// a security exception
	link.setAttribute("f-client-nav", "false")

	// Set the object link and filename
	link.href = url
	link.download = filename

	// Simulate a click
	link.click()

	// Cleanup link after download
	setTimeout(() => {
		link.remove()
	}, 0)
}

/**
 * Downloads a given file in the browser
 * @param f File to download
 */
export function downloadFile(f: File): void {
	// Creates a download URL for the blob
	const objectURL = URL.createObjectURL(f)

	downloadDataURL(objectURL, f.name)

	// Cleanup object URL and link after download
	setTimeout(() => {
		URL.revokeObjectURL(objectURL)
	}, 0)
}
