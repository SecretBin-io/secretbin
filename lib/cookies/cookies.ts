import { decodeCookieName, decodeCookieValue, encodeCookieName, encodeCookieValue } from "./convert.ts"
import { CookieOptions, CookieSubscriber, CookieUnsubscriber, PrimitiveType } from "./types.ts"

/**
 * Interact with cookies and subscribe to changes. Cookies intercepts calls to document.cookie
 * in order to notify subscribers when a cookie has changed.
 * It uses js-cookie under the hood
 */
export class Cookies {
	/**
	 * Stores all subscribers for specific cookie names
	 */
	static #subscribers: Record<string, CookieSubscriber[]> = {}

	/**
	 * Keeps track if the interceptor has already been installed
	 */
	static #isIntercepting = false

	/**
	 * Intercepts calls to document.cookie in order to notify subscribers
	 */
	static #startIntercepting(): void {
		// Return if the interceptor is ready installed
		if (this.#isIntercepting) {
			return
		}

		// Only use interception if cookies are enabled
		if (!navigator.cookieEnabled) {
			return
		}

		// Save the original cookie functionality
		const original = Object.getOwnPropertyDescriptor(globalThis.Document.prototype, "cookie")!
		const getCookie = original.get?.bind(globalThis.document)!
		const setCookie = original.set?.bind(globalThis.document)!

		// If the descriptor is not configurable, interception won't work
		if (!original.configurable) {
			// deno-lint-ignore no-console
			console.log("[Cookie Interception] Cannot react to cookie changes, because interception has been blocked.")
			return
		}

		// Install the interceptor
		Object.defineProperty(globalThis.document, "cookie", {
			configurable: true,
			// Do not intercept cookie reading
			get: getCookie,

			// Intercept cookie writing
			set: function (value: string): void {
				// Ignore invalid values
				if (!value.includes("=")) {
					return setCookie(value)
				}

				// Extract the cookie name
				const name = value.substring(0, value.indexOf("="))

				// Get the old cookie value
				const oldValue = Cookies.get(name)

				// Write the cookie using the original function
				setCookie(value)

				// Get the new cookie value
				const newValue = Cookies.get(name)

				// Notify subscribers
				Cookies.#subscribers[name]?.forEach((f) => f(newValue, oldValue))
			},
		})

		Cookies.#isIntercepting = true
	}

	/**
	 * Subscribes to changes to a cookie with a given name
	 * @param name Cookie name
	 * @param f Subscriber function
	 * @returns Unsubscribe function
	 */
	public static subscribe(name: string, f: CookieSubscriber): CookieUnsubscriber {
		// Start interception cookie writes once the first subscriber is added
		Cookies.#startIntercepting()

		// Store the subscriber function
		if (!(name in Cookies.#subscribers)) {
			Cookies.#subscribers[name] = []
		}

		Cookies.#subscribers[name].push(f)

		// Returns an unsubscribe function
		return () => {
			Cookies.#subscribers[name].splice(Cookies.#subscribers[name].indexOf(f))
		}
	}

	/**
	 * Reads and parse a cookie with a given name.
	 * @param name Cookie name
	 * @param defaultValue Default value if the cookie does not exist
	 * @returns Parsed cookie value or default value if the cookie does not exist
	 */
	public static get(name: string): PrimitiveType | undefined
	public static get(name: string, defaultValue: string): string
	public static get(name: string, defaultValue: number): number
	public static get(name: string, defaultValue: boolean): boolean
	public static get<T extends PrimitiveType>(name: string, defaultValue: T): T
	public static get<T>(name: string, defaultValue?: T): T | PrimitiveType | undefined {
		if (typeof globalThis.document === "undefined") {
			return
		}

		for (const cookie of globalThis.document.cookie?.split("; ") ?? []) {
			const [key, value] = cookie.split("=", 2)

			try {
				if (decodeCookieName(key) === name) {
					return decodeCookieValue(value)
				}
			} catch {
				// Do nothing...
			}
		}

		// Return the default value if cookie was not found
		return defaultValue
	}

	/**
	 * Writes a cookie with a give name.
	 * @param name Cookie name
	 * @param value Cookie value
	 * @param options Cookie options
	 */
	public static set<T extends PrimitiveType>(name: string, value: T, options: CookieOptions = {}): void {
		if (typeof globalThis.document === "undefined") {
			return
		}

		let cookie = `${encodeCookieName(name)}=${encodeCookieValue(value)}; Path=${options.path ?? "/"}`

		if (typeof options.expires === "number") {
			cookie += `; Max-Age=${options.expires * 24 * 60 * 60}`
		} else if (options.expires instanceof Date) {
			cookie += `; Expires=${options.expires.toUTCString()}`
		}

		if (options.domain) {
			cookie += `; Domain=${options.domain}`
		}

		if (options.sameSite) {
			cookie += `; SameSite=${options.sameSite}`
		}

		if (options.secure) {
			cookie += `; Secure`
		}

		globalThis.document.cookie = cookie
	}

	/**
	 * Removes a cookie with a give name.
	 * @param name Cookie name
	 * @param options Cookie options
	 */
	public static remove(name: string, options: CookieOptions = {}): void {
		this.set(name, "", { ...options, expires: -1 })
	}
}
