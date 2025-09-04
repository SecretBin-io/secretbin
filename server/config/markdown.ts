import { marked } from "marked"
// @deno-types="npm:@types/sanitize-html@2.16.0"
import sanitizeHtml from "sanitize-html"

/**
 * Render a markdown file to HTML. This function is only available in
 * the server environment.
 * @param file The path to the markdown file to render.
 * @returns The rendered HTML as a string.
 */
export async function renderMarkdown(file: string): Promise<string> {
	// Read the markdown file from the file system.
	const src = await Deno.readTextFile(file)

	// Render the markdown file to HTML.
	const html = await marked.parse(src, {})
	const markdown = sanitizeHtml(html, {
		allowProtocolRelative: false,
		parser: {
			lowerCaseAttributeNames: false,
		},
	})

	// Wrap the rendered markdown in a div with the class "markdown-body" to
	// apply the custom styles.
	return `<div class="markdown-body">${markdown}</div>`
}
