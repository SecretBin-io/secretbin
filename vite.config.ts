import { fresh } from "@fresh/plugin-vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
	build: {
		minify: true,
		cssMinify: true,
	},
	plugins: [
		fresh(),
		tailwindcss(),
	],
})
