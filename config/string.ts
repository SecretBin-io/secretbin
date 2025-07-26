import z from "@zod/zod"
import { IS_BROWSER } from "fresh/runtime"

/**
 * Render a markdown file to HTML. This function is only available in
 * the server environment.
 * @param file The path to the markdown file to render.
 * @returns The rendered HTML as a string.
 */
async function renderMarkdown(file: string): Promise<string> {
	if (IS_BROWSER) {
		throw new Error("This function cannot be used in the browser")
	}

	// Import gfm here to avoid bundling it in the browser
	// and to ensure it is only used in the server environment.
	const Marked = await import("marked")
	// @deno-types="npm:@types/sanitize-html@2.16.0"
	const { default: sanitizeHtml } = await import("sanitize-html")

	// Read the markdown file from the file system.
	const src = await Deno.readTextFile(file)

	// Render the markdown file to HTML.
	const html = await Marked.marked.parse(src, {})
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

/**
 * Record where the keys are the languages codes and the value are the
 * string in that respective language
 */
export type TranslatedString = Record<string, string>
export const TranslatedString = z.record(
	z.string(),
	z.union([
		z.string(),
		z.object({ file: z.string() })
			.transform(({ file }) => renderMarkdown(file)),
	]),
)
