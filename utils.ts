import { getCookies } from "@std/http"
import { createDefine } from "fresh"
import { isLanguageSupported, Language } from "lang"
import { logWeb } from "log"
import { State, Theme } from "state"

export const define = createDefine<State>()

/**
 * Detect preferred locales from the headers sent by the browser
 * @param headers Request headers
 * @returns List of locales as reported by the client's browser
 */
function detectBrowserLocales(headers: Headers): string[] {
	return (headers.get("Accept-Language") ?? "")
		.split(",")
		.map((lang): [number, string] => {
			const [locale, q = "q=1"] = lang.split(";")
			const trimmedLocale = locale.trim()
			const numQ = Number(q.replace(/q ?=/, ""))
			return [isNaN(numQ) ? 0 : numQ, trimmedLocale]
		})
		.sort(([q1], [q2]) => q2 - q1)
		.flatMap(([_, locale]) => locale === "*" ? [] : locale)
}

/**
 * Middleware that adds the request state to the request context
 */
export const stateMiddleware = define.middleware(async (ctx) => {
	ctx.state.cookies = getCookies(ctx.req.headers)

	const locales = detectBrowserLocales(ctx.req.headers)
	ctx.state.locale = locales.find(() => true) ?? "en-US"
	ctx.state.language = [ctx.state.cookies["language"], ...locales]
		.find(isLanguageSupported) as Language ?? Language.English

	ctx.state.theme = ctx.state.cookies["theme"] === "light" ? Theme.Light : Theme.Dark

	return await ctx.next()
})

/**
 * Middleware that logs requests
 */
export const loggingMiddleware = define.middleware(async (ctx) => {
	const res = await ctx.next()
	const msg = `${ctx.req.method} [${res.status}] ${ctx.req.url}`
	const args = {
		method: ctx.req.method,
		url: ctx.req.url,
		status: res.status,
	}

	if (res.status >= 200 && res.status <= 299) {
		logWeb.info(msg, args)
	} else if (res.status >= 500 && res.status <= 599) {
		logWeb.error(msg, args)
	} else {
		logWeb.warn(msg, args)
	}
	return res
})
