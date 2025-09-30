import { define } from "utils"
import { Theme } from "utils/state"

/**
 * Renders the branded manifest.json for PWA usage
 */
export const handler = define.handlers({
	GET({ state }): Response {
		return new Response(JSON.stringify({
			name: state.config.branding.appName,
			short_name: state.config.branding.appName,
			theme_color: state.theme === Theme.Dark ? "#121826" : "#ffffff",
			background_color: state.theme === Theme.Dark ? "#121826" : "#ffffff",
			display: "fullscreen",
			scope: "/",
			start_url: "/",
			orientation: "portrait-primary",
			icons: [
				{
					src: assetPath("/images/android-chrome-192x192.png"),
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: assetPath("/images/android-chrome-512x512.png"),
					sizes: "512x512",
					type: "image/png",
				},
			],
		}))
	},
})
