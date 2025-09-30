import { Middleware } from "fresh"
import { asset } from "utils/assets"

/**
 * Serves static files from the public folder. These files are not embedded in the build
 * and are intended for serving custom files.
 * @returns Middleware
 */
export function publicFiles<T>(): Middleware<T> {
	return async (ctx): Promise<Response> => {
		const { req, url, config } = ctx

		let pathname = decodeURIComponent(url.pathname)
		if (config.basePath) {
			pathname = pathname !== config.basePath ? pathname.slice(config.basePath.length) : "/"
		}

		const a = asset(pathname)
		if (pathname === "/" || a === undefined || (req.method !== "GET" && req.method !== "HEAD")) {
			return await ctx.next()
		}

		const headers = new Headers({
			"Content-Type": a.contentType,
			"Content-Length": String(a.size),
		})

		if (req.method === "HEAD") {
			return new Response(null, { status: 200, headers })
		}

		return new Response(a.content, { headers })
	}
}
