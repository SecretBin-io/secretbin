export let MessagePreview = ""

/**
 * Helper function for temporarily storing the secret message in the browser's
 * memory in order to show it in the share screen.
 * @param s Secret message
 */
export function setMessagePreview(s: string): void {
	MessagePreview = s
}
