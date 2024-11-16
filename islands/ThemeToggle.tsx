import { Cookies } from "@nihility-io/cookies"
import { Button } from "components"
import { useEffect, useState } from "preact/hooks"

export interface ThemeToggleProps {
	/** Name of the cookie which stores the preferred theme (default: color-theme) */
	cookie?: string
}

/**
 * Creates a toggle for switching between light and dark mode
 */
export const ThemeToggle = ({ cookie = "color-theme" }: ThemeToggleProps) => {
	const [isDark, setIsDark] = useState(
		typeof document !== "undefined"
			? Cookies.get<string>(
				cookie,
				globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
			) === "dark"
			: false,
	)

	useEffect(() => {
		Cookies.set(cookie, isDark ? "dark" : "light", { expires: 3650 })
		if (isDark) {
			globalThis.document.documentElement.classList.add("dark")
			globalThis.document.documentElement.classList.remove("light")
		} else {
			globalThis.document.documentElement.classList.add("light")
			globalThis.document.documentElement.classList.remove("dark")
		}
	}, [isDark])

	return (
		<>
			<Button
				overrideClass
				class="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
				onClick={() => setIsDark(!isDark)}
				icon={isDark ? "Day" : "Night"}
			/>
		</>
	)
}
