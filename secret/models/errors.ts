import Record from "@nihility-io/record"
import { STATUS_CODE } from "@std/http/status"
import { humanReadableSize, registerErrorTypes } from "helpers"
import { LocalizedError } from "lang"
import z from "zod"

/**
 * Implement a error sub-class for each error
 */
export class SecretNotFoundError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.NotFound, "SecretNotFoundError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretNotFoundError(params.id as string)
	}
}

export class SecretAlreadyExistsError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.Conflict, "SecretAlreadyExistsError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretAlreadyExistsError(params.id as string)
	}
}

export class SecretListError extends LocalizedError {
	public constructor() {
		super(STATUS_CODE.InternalServerError, "SecretListError")
	}

	public static fromObject(_message: string, _params: Record<string, unknown>): Error {
		return new SecretListError()
	}
}

export class SecretReadError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.InternalServerError, "SecretReadError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretReadError(params.id as string)
	}
}

export class SecretCreateError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.BadRequest, "SecretCreateError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretCreateError(params.id as string)
	}
}

export class SecretUpdateError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.InternalServerError, "SecretUpdateError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretUpdateError(params.id as string)
	}
}

export class SecretDeleteError extends LocalizedError {
	public constructor(public id: string) {
		super(STATUS_CODE.InternalServerError, "SecretDeleteError", { id })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretDeleteError(params.id as string)
	}
}

export class SecretParseError extends LocalizedError {
	public constructor(public issues: z.core.$ZodIssue[]) {
		super(STATUS_CODE.BadRequest, "SecretParseError", { reasons: issues.map((x) => x.message).join(", ") })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretParseError(params.issues as z.core.$ZodIssue[])
	}
}

export class SecretPolicyError extends LocalizedError {
	public constructor(public reason: string) {
		super(STATUS_CODE.Forbidden, "SecretPolicyError", { reason })
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretPolicyError(params.reason as string)
	}
}

export class SecretSizeLimitError extends LocalizedError {
	public constructor(public size: number, public maxSize: number) {
		super(STATUS_CODE.ContentTooLarge, "SecretSizeLimitError", {
			size: humanReadableSize(size),
			maxSize: humanReadableSize(maxSize),
		})
	}

	public static fromObject(_message: string, params: Record<string, unknown>): Error {
		return new SecretSizeLimitError(params.size as number, params.maxSize as number)
	}
}

/**
 * Register error types for decoding.
 */
registerErrorTypes(
	SecretNotFoundError,
	SecretAlreadyExistsError,
	SecretListError,
	SecretReadError,
	SecretCreateError,
	SecretUpdateError,
	SecretDeleteError,
	SecretParseError,
	SecretPolicyError,
	SecretSizeLimitError,
)
