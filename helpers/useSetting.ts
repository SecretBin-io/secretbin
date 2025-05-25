import { PrimitiveType, useCookie } from "@nihility-io/cookies"
import { Dispatch } from "preact/hooks"
import { State } from "state"

/**
 * Creates a preact state that stores a setting inside a cookie.
 * @param name Setting name
 * @param defaultValue Default value for the setting
 * @param state Optionally pass the request state, so the Preact can pre-render by
 * getting the cookie value from the request
 * @returns
 */
export function useSetting(name: string, defaultValue: string, state?: State): [string, Dispatch<string>]
export function useSetting(name: string, defaultValue: number, state?: State): [number, Dispatch<number>]
export function useSetting(name: string, defaultValue: boolean, state?: State): [boolean, Dispatch<boolean>]
export function useSetting<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	state?: State,
): [T, Dispatch<T>] {
	// Create a preact state with the default value
	const stateCookieValue = (() => {
		const value = state?.cookies?.[name]
		if (value === undefined || value === null) {
			return undefined
		}

		switch (typeof defaultValue) {
			case "string":
				return value as T
			case "number":
				return +value as T
			case "boolean":
				return (value.toLowerCase() === "true") as T
		}
	})()
	return useCookie<T>(name, stateCookieValue !== undefined ? stateCookieValue : defaultValue)
}
