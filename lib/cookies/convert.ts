import { PrimitiveType } from "./types.ts"

/**
 * Converts the unsafe cookie name into a name safe for storage
 * @param name Unsafe cookie name
 * @returns Safely encoded cookie name
 */
export function encodeCookieName(name: string): string {
	return encodeURIComponent(name)
}

/**
 * Converts the safely encoded cookie name back to the original
 * @param name Encoded cookie name
 * @returns Original cookie name
 */
export function decodeCookieName(name: string): string {
	return decodeURIComponent(name)
}

/**
 * Convert a boolean, number or string into a cookie value
 * @param value Value
 * @returns String value
 */
export function encodeCookieValue<T extends PrimitiveType>(value: T): string {
	switch (typeof value) {
		case "string":
			return encodeURIComponent(value)
		case "number":
			return `${value}`
		case "boolean":
			return value ? "true" : "false"
	}
}

/**
 * Converts a cookie value into boolean, number or string
 * @param value String value
 * @returns Converted value
 */
export function decodeCookieValue(value: string): PrimitiveType {
	if (value === "true") {
		return true
	} else if (value === "false") {
		return false
	} else if (/^-?\d+(\.\d+)?$/.test(value)) {
		return +value
	}

	return decodeURIComponent(value)
}
