import { fresh } from "@fresh/plugin-vite"
import tailwindcss from "@tailwindcss/vite"
import { browserTarget } from "utils/browsers"
import { defineConfig } from "vite"

export default defineConfig({
	server: {
		port: 8000,
	},
	build: {
		minify: true,
		cssMinify: true,
		target: browserTarget,
	},
	plugins: [
		fresh(),
		tailwindcss(),
	],
})
