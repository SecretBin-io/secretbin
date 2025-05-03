import { config } from "config"
import { type HandlerByMethod } from "fresh"
import { asset } from "fresh/runtime"
import { State, Theme } from "state"

/**
 * Renders the branded manifest.json for PWA usage
 */
export const handler: HandlerByMethod<unknown, State> = {
	GET({ state }) {
		return new Response(JSON.stringify({
			name: config.branding.appName,
			short_name: config.branding.appName,
			theme_color: state.theme === Theme.Dark ? "#121826" : "#ffffff",
			background_color: state.theme === Theme.Dark ? "#121826" : "#ffffff",
			display: "fullscreen",
			scope: "/",
			start_url: "/",
			orientation: "portrait-primary",
			icons: [
				{
					src: asset("/images/android-chrome-192x192.png"),
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: asset("/images/android-chrome-512x512.png"),
					sizes: "512x512",
					type: "image/png",
				},
			],
		}))
	},
}
