import { asset } from "$fresh/runtime.ts"
import { FreshContext, Handlers } from "$fresh/server.ts"
import { config } from "config"
import { Context, Theme } from "context"

/**
 * Renders the branded manifest.json for PWA usage
 */
export const handler: Handlers<unknown, Context> = {
	GET(_req: Request, { state: ctx }: FreshContext<Context>) {
		return new Response(JSON.stringify({
			"name": config.branding.appName,
			"short_name": config.branding.appName,
			"theme_color": ctx.theme === Theme.Dark ? "#121826" : "#ffffff",
			"background_color": ctx.theme === Theme.Dark ? "#121826" : "#ffffff",
			"display": "fullscreen",
			"scope": "/",
			"start_url": "/",
			"orientation": "portrait-primary",
			"icons": [
				{
					"src": asset("/images/android-chrome-192x192.png"),
					"sizes": "192x192",
					"type": "image/png",
				},
				{
					"src": asset("/images/android-chrome-512x512.png"),
					"sizes": "512x512",
					"type": "image/png",
				},
			],
		}))
	},
}
