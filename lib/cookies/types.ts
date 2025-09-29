/**
 * JavaScript primitive type
 */
export type PrimitiveType = string | number | boolean

/**
 * Function that called whenever a change to the specified cookie occurs
 */
export type CookieSubscriber = (value?: PrimitiveType, oldValue?: PrimitiveType) => void

/**
 * Functions that removes a subscriber
 */
export type CookieUnsubscriber = () => void

/**
 * Defines additional cookie parameters
 */
export interface CookieOptions {
	/**
	 * Define when the cookie will be removed. Value can be a Number
	 * which will be interpreted as days from time of creation or a
	 * Date instance. If omitted, the cookie becomes a session cookie.
	 */
	expires?: number | Date

	/**
	 * Define the path where the cookie is available. Defaults to '/'
	 */
	path?: string

	/**
	 * Define the domain where the cookie is available. Defaults to
	 * the domain of the page where the cookie was created.
	 */
	domain?: string

	/**
	 * A Boolean indicating if the cookie transmission requires a
	 * secure protocol (https). Defaults to false.
	 */
	secure?: boolean

	/**
	 * Asserts that a cookie must not be sent with cross-origin requests,
	 * providing some protection against cross-site request forgery
	 * attacks (CSRF)
	 */
	sameSite?: "strict" | "Strict" | "lax" | "Lax" | "none" | "None"
}
