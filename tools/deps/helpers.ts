/**
 * Removes a given prefix from a string if the string has it
 * @param s String
 * @param prefix Prefix to remove
 * @returns String without the prefix
 */
export function trimPrefix(s: string, prefix: string): string {
	return s.startsWith(prefix) ? s.slice(prefix.length) : s
}

/**
 * Removes a given suffix from a string if the string has it
 * @param s String
 * @param suffix Suffix to remove
 * @returns String without the suffix
 */
export function trimSuffix(s: string, suffix: string): string {
	return s.endsWith(suffix) ? s.slice(0, -suffix.length) : s
}

/**
 * Replace a given prefix from a string with another string
 * @param s String
 * @param prefix Prefix that should be replace
 * @param replacement Replacement string
 * @returns String with replaced prefix
 */
export function replacePrefix(s: string, prefix: string, replacement: string): string {
	return s.startsWith(prefix) ? replacement + s.slice(prefix.length) : s
}

/**
 * Replace a given suffix from a string with another string
 * @param s String
 * @param suffix Suffix that should be replace
 * @param replacement Replacement string
 * @returns String with replaced suffix
 */
export function replaceSuffix(s: string, suffix: string, replacement: string): string {
	return s.endsWith(suffix) ? s.slice(0, -suffix.length) + replacement : s
}
