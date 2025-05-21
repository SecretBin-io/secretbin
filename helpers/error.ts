/**
 * Custom decodable error type.
 */
export interface DecodableErrorType {
	name: string
	fromObject(message: string, params: Record<string, unknown>): Error
}

export interface ErrorObject {
	name: string
	message: string
	[key: string]: unknown
}

const decodableErrorTypes: Record<string, DecodableErrorType> = {}

/**
 * Registers a custom decodable error type, which is used by `decodeError`.
 * @param err Decodable error type
 */
export const registerErrorType = (err: DecodableErrorType) => {
	decodableErrorTypes[err.name] = err
}

/**
 * Registers custom decodable error types, which are used by `decodeError`.
 * @param err Decodable error types
 */
export const registerErrorTypes = (...err: DecodableErrorType[]) => {
	err.forEach((e) => {
		decodableErrorTypes[e.name] = e
	})
}

/**
 * Encodes all error properties except for the stack into a plain object
 * which can then be stringified.
 * @param err Error that should be encoded
 * @returns Plain object representing the error
 */
export const encodeError = (err: Error) =>
	Object.getOwnPropertyNames(err)
		.filter((x) => x !== "stack")
		.reduce((res, key) => ({
			...res,
			[key]: (err as unknown as Record<string, unknown>)[key],
		}), { name: err.name, message: err.message })

/**
 * Decodes an error type from the given plain object and adds the additional properties to it.
 * Support are: TypeError, EvalError, RangeError, ReferenceError, SyntaxError, URIError and customer errors
 * registered with registerErrorType.
 * @param name Name of the error type
 * @param message Error message
 * @param additionalProps Object containing additional properties
 * @returns Instance of an error class
 */
export const decodeError = ({ name, message, ...props }: ErrorObject) => {
	if (Object.hasOwn(registerErrorType, name)) {
		return decodableErrorTypes[name].fromObject(message, props as never)
	}

	const err = (() => {
		switch (name) {
			case "TypeError":
				return new TypeError(message)
			case "EvalError":
				return new EvalError(message)
			case "RangeError":
				return new RangeError(message)
			case "ReferenceError":
				return new ReferenceError(message)
			case "SyntaxError":
				return new SyntaxError(message)
			case "URIError":
				return new URIError(message)
			default:
				return Object.defineProperty(new Error(message), "name", {
					value: name,
				})
		}
	})()

	Object.keys(props)
		.forEach((key) =>
			Object.defineProperty(err, key, {
				value: props[key],
			})
		)

	return Object.defineProperty(err, "stack", { value: "" })
}
