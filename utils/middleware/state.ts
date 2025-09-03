import { getCookies } from "@std/http"
import { clientCfg } from "config"
import { isLanguageSupported, Language } from "lang"
import { define } from "utils"
import { Theme } from "utils/state"

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

	ctx.state.config = {
		...clientCfg,
		branding: {
			...clientCfg.branding,
			terms: undefined, // By default do not include the terms in the config sent to the client
		},
	}
	if (ctx.state.cookies["showTerms"] !== "false") {
		ctx.state.config.branding.terms = clientCfg.branding.terms
	}

	return await ctx.next()
})
