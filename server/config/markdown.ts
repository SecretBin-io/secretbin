import { marked } from "marked"
import { transform } from "ultrahtml"
import sanitize, { SanitizeOptions } from "ultrahtml/transformers/sanitize"

const sanitizeConfig: SanitizeOptions = {
	// Allowed elements/tags — only these will be kept, everything else dropped or stripped
	allowElements: [
		["abbr", "b", "strong", "i", "em", "u", "s"],
		["del", "mark", "small", "sub", "sup", "p"],
		["br", "hr", "blockquote", "pre", "code"],
		["ul", "ol", "li", "dl", "dt", "dd", "h1"],
		["h2", "h3", "h4", "h5", "h6", "span", "q"],
		["cite", "time", "table", "thead", "tbody"],
		["tfoot", "tr", "th", "td", "caption", "div"],
	].flat(),

	// Allowed attributes per tag
	allowAttributes: {
		title: ["*"],
		class: ["*"],
		id: ["*"],
		lang: ["*"],
		dir: ["*"],
		colspan: ["td", "th"],
		rowspan: ["td", "th"],
		scope: ["th"],
	},

	// explicitly drop common event-handler attributes from all allowed elements
	dropAttributes: {
		onclick: ["*"],
		onload: ["*"],
		onerror: ["*"],
		onsubmit: ["*"],
		onfocus: ["*"],
		onblur: ["*"],
		onkeydown: ["*"],
		onkeypress: ["*"],
		onkeyup: ["*"],
		oninput: ["*"],
		onchange: ["*"],
		onmouseover: ["*"],
		onmouseout: ["*"],
		onmousedown: ["*"],
		onmouseup: ["*"],
		onwheel: ["*"],
	},
}

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
	const source = await marked.parse(src, {})

	const output = await transform(source, [
		sanitize(sanitizeConfig),
	])

	// Wrap the rendered markdown in a div with the class "markdown-body" to
	// apply the custom styles.
	return `<div class="markdown-body">${output}</div>`
}
