import Cookies, { CookieOptions, PrimitiveType } from "lib/cookies"
import { Dispatch, useEffect, useState } from "preact/hooks"

/**
 * Creates a preact state that stores the value inside a cookie. useCookie updates in response
 * to external cookie updates
 * @param name Cookie name
 * @param defaultValue Default value if the cookie does not exist
 * @param options Cookie options (Cookie expires after 10 years by default)
 * @returns Current cookie value
 */
export function useCookie(name: string, defaultValue: string, options?: CookieOptions): [string, Dispatch<string>]
export function useCookie(name: string, defaultValue: number, options?: CookieOptions): [number, Dispatch<number>]
export function useCookie(name: string, defaultValue: boolean, options?: CookieOptions): [boolean, Dispatch<boolean>]
export function useCookie<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	options?: CookieOptions,
): [T, Dispatch<T>]
export function useCookie<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	options: CookieOptions = { expires: 3650 },
): [T, Dispatch<T>] {
	// Create a preact state with the default value
	const [result, setResult] = useState<T>(defaultValue)

	useEffect(() => {
		// Read the current cookie value
		const value = Cookies.get(name) as T | undefined
		// Write the default value to the cookie is no value was set
		if (!value) {
			setter(defaultValue)
		}
		setResult(value ?? defaultValue)

		// Subscribe to changes to the cookie and update the state if changes are detected
		const unsubscribe = Cookies.subscribe(name, (newValue) => {
			setResult(newValue as T)
		})

		// Unsubscribe on cleanup
		return () => {
			unsubscribe()
		}
	}, [defaultValue])

	// Cookie setter
	const setter = (newValue: T) => {
		Cookies.set(name, newValue, options)
	}

	return [result, setter]
}
