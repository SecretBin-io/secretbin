import { FreshContext, PageProps } from "$fresh/server.ts"
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
export const addContext = async (req: Request, ctx: FreshContext<Context>) => {
	const { getCookies } = await import("@std/http")

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
