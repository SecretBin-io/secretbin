import { Signal, signal } from "@preact/signals"
import { CookieOptions, Cookies, PrimitiveType } from "lib/cookies"
import { Dispatch, useEffect, useState } from "preact/hooks"
import { useCookie } from "utils/hooks"
import { State } from "utils/state"

/**
 * Creates a preact state that stores a setting inside a cookie.
 * @param name Setting name
 * @param defaultValue Default value for the setting
 * @param state Optionally pass the request state, so the Preact can pre-render by
 * getting the cookie value from the request
 * @param options Cookie options
 * @returns
 */
export function useSetting(
	name: string,
	defaultValue: string,
	state?: State,
	options?: CookieOptions,
): [string, Dispatch<string>]
export function useSetting(
	name: string,
	defaultValue: number,
	state?: State,
	options?: CookieOptions,
): [number, Dispatch<number>]
export function useSetting(
	name: string,
	defaultValue: boolean,
	state?: State,
	options?: CookieOptions,
): [boolean, Dispatch<boolean>]
export function useSetting<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	state?: State,
	options?: CookieOptions,
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
	return useCookie<T>(name, stateCookieValue !== undefined ? stateCookieValue : defaultValue, options)
}

/**
 * Creates a preact signal that stores a setting inside a cookie.
 * @param name Setting name
 * @param defaultValue Default value for the setting
 * @param state Optionally pass the request state, so the Preact can pre-render by
 * getting the cookie value from the request
 * @param options Cookie options
 * @returns
 */
export function useSettingSignal(
	name: string,
	defaultValue: string,
	state?: State,
	options?: CookieOptions,
): Signal<string>
export function useSettingSignal(
	name: string,
	defaultValue: number,
	state?: State,
	options?: CookieOptions,
): Signal<number>
export function useSettingSignal(
	name: string,
	defaultValue: boolean,
	state?: State,
	options?: CookieOptions,
): Signal<boolean>
export function useSettingSignal<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	state?: State,
	options?: CookieOptions,
): Signal<T>
export function useSettingSignal<T extends PrimitiveType>(
	name: string,
	defaultValue: T,
	state?: State,
	options?: CookieOptions,
): Signal<T> {
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
	})() ?? defaultValue

	const s = useState(() => signal<T>(stateCookieValue))[0]

	s.subscribe((x) => {
		if (Cookies.get(name) !== x) {
			Cookies.set(name, x, options)
		}
	})

	useEffect(() => {
		// Read the current cookie value
		s.value = Cookies.get(name, stateCookieValue) as T

		// Subscribe to changes to the cookie and update the state if changes are detected
		const unsubscribe = Cookies.subscribe(name, (newValue) => {
			if (newValue !== s.value) {
				s.value = newValue as T
			}
		})

		// Unsubscribe on cleanup
		return () => {
			unsubscribe()
		}
	}, [typeof defaultValue === "object" ? JSON.stringify(defaultValue) : defaultValue])

	return s
}
