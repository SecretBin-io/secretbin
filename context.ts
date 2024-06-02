import { FreshContext, PageProps } from "$fresh/server.ts"
import { getCookies } from "@std/http"
import { Language } from "lang"

export enum Theme {
	Light = "light",
	Dark = "dark",
}

export interface Context {
	lang: Language
	theme: Theme
}

export interface PagePropsWithContext<Data = unknown> extends PageProps<Data, Context> {}

/**
 * Adds custom context to the Fresh context state
 * @param req Incoming request
 * @param ctx Fresh Context
 */
export const addContext = (req: Request, ctx: FreshContext<Context>) => {
	ctx.state.theme = (() => {
		switch (getCookies(req.headers)["color-theme"] ?? "dark") {
			case "light":
				return Theme.Light
			case "dark":
				return Theme.Dark
			default:
				return Theme.Light
		}
	})()
}
