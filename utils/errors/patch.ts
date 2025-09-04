// TODO: Remove when or if https://github.com/denoland/fresh/issues/2995 is implemented
// This is a workaround which allows LocalizedError to be recognized as an instance of

import { HttpError } from "fresh"
import { LocalizedError } from "utils/errors"

// HttpError, which is needed for Fresh to set the correct status code.
const orig = HttpError[Symbol.hasInstance]
Object.defineProperty(HttpError, Symbol.hasInstance, {
	get(): (this: HttpError, obj: unknown) => boolean {
		return function (this: HttpError, obj: unknown): boolean {
			// instanceof returns true for HttpError and LocalizedError
			return orig.call(this, obj) || obj instanceof LocalizedError
		}
	},
})
