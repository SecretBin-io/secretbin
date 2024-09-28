import { createDefine } from "fresh"
import { State, Theme } from "state"
import { isLanguageSupported, Language } from "lang"
import { getCookies } from "@std/http"

export const define = createDefine<State>()

export const stateMiddleware = define.middleware(async (ctx) => {
    ctx.state.locales = (ctx.req.headers.get("Accept-Language") ?? "")
        .split(",")
        .map((lang): [number, string] => {
            const [locale, q = "q=1"] = lang.split(";")
            const trimmedLocale = locale.trim()
            const numQ = Number(q.replace(/q ?=/, ""))
            return [isNaN(numQ) ? 0 : numQ, trimmedLocale]
        })
        .sort(([q1], [q2]) => q2 - q1)
        .flatMap(([_, locale]) => locale === "*" ? [] : locale)

    ctx.state.locale = ctx.state.locales.find(() => true) ?? "en-US"

    const cookieLang = getCookies(ctx.req.headers)["lang"]
    if (cookieLang && isLanguageSupported(cookieLang)) {
        ctx.state.lang = cookieLang as Language
    } else {
        ctx.state.lang = ctx.state.locales.find(isLanguageSupported) as Language ?? Language.English
    }

    ctx.state.theme = (() => {
        switch (getCookies(ctx.req.headers)["color-theme"] ?? "dark") {
            case "light":
                return Theme.Light
            case "dark":
                return Theme.Dark
            default:
                return Theme.Light
        }
    })()

    return await ctx.next()
})
