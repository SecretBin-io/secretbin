export type FlattenObjectKeys<T extends Record<string, unknown>, Key = keyof T> = Key extends string
    ? T[Key] extends Record<string, unknown> ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : `${Key}`
    : never

export type TrimPrefix<TPrefix extends string, T extends string> = T extends `${TPrefix}.${infer R}` ? R : never

/**
 * Compile strings containing variables
 * @param template Template string
 * @param params Variables to replace
 * @example
 * formatString("Hello, {{name}}!", { name: "John Smith" }) // => "Hello, John Smith!"
 */
export const formatString = (template: string, params: Record<string, string>): string => {
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
