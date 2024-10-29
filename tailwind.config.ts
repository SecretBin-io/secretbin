import type { Config } from "tailwindcss"
import Flowbite from "flowbite/plugin.js"
import plugin from "tailwindcss/plugin"

export default {
	darkMode: "class",
	content: [
		"{routes,islands,components}/**/*.{ts,tsx}",
	],
	plugins: [
		Flowbite,
		plugin(({ addVariant }) => {
			addVariant("third", "&:nth-child(3)")
		}),
	],
} satisfies Config
