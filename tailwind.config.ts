import type { Config } from "tailwindcss"
import Flowbite from "flowbite/plugin.js"

export default {
  darkMode: "class",
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  plugins: [Flowbite],
} satisfies Config
