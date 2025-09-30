export type TrimPrefix<TPrefix extends string, T extends string> = T extends `${TPrefix}.${infer R}` ? R : never

export type TrimSuffix<TSuffix extends string, T extends string> = T extends `${infer R}.${TSuffix}` ? R : never

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

/**
 * Compile strings containing variables
 * @param template Template string
 * @param params Variables to replace
 * @example
 * formatString("Hello, {{name}}!", { name: "John Smith" }) // => "Hello, John Smith!"
 */
export function format(template: string, params: Record<string, string>): string {
	let res = ""
	let v = ""
	let brackets = 0

	for (const l of template) {
		switch (l) {
			case "{": {
				if (brackets < 0 || brackets > 1) {
					return template
				}
				brackets++
				break
			}
			case "}": {
				if (brackets < 1 || brackets > 2) {
					return template
				}
				brackets--
				if (brackets === 0) {
					res += params[v.trim()] ?? `__INVALID_PARAM__`
					v = ""
				}
				break
			}
			default: {
				if (brackets === 2) {
					v += l
				} else {
					res += l
				}
			}
		}
	}
	return res
}
