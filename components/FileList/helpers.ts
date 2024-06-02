/**
 * Downloads a given file in the browser
 * @param f File to download
 */
export const downloadFile = (f: File) => {
	// Creates a download URL for the blob
	const objectURL = URL.createObjectURL(f)

	// In order to download a file with JavaScript, we need to create
	// an anchor element with the blob link and programmatically
	// click it
	const link = globalThis.document.createElement("a")
	link.style.display = "none"

	// Disable Deno Fresh partials for this link, otherwise we'll get
	// a security exception
	link.setAttribute("f-client-nav", "false")

	// Set the object link and filename
	link.href = objectURL
	link.download = f.name

	// Add link to DOM and simulate a click
	globalThis.document.body.appendChild(link)
	link.click()

	// Cleanup object URL and link after download
	setTimeout(() => {
		link.remove()
		URL.revokeObjectURL(objectURL)
	}, 0)
}
