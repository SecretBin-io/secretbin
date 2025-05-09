import Record from "@nihility-io/record"
import Result from "@nihility-io/result"
import { STATUS_CODE } from "@std/http/status"
import { humanReadableSize } from "helpers"
import { LocalizedError } from "lang"
import { z } from "zod"

/**
 * Implement a error sub-class for each error
 */
export class SecretNotFoundError extends LocalizedError {
	public override code = STATUS_CODE.NotFound
	public constructor(public id: string) {
		super("SecretNotFoundError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretNotFoundError(params.id as string)
	}
}

export class SecretAlreadyExistsError extends LocalizedError {
	public override code = STATUS_CODE.Conflict
	public constructor(public id: string) {
		super("SecretAlreadyExistsError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretAlreadyExistsError(params.id as string)
	}
}

export class SecretListError extends LocalizedError {
	public constructor() {
		super("SecretListError")
	}

	public static fromResultFailure(_message: string, _params: Record<string, unknown>): Error {
		return new SecretListError()
	}
}

export class SecretReadError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretReadError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretReadError(params.id as string)
	}
}

export class SecretCreateError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretCreateError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretCreateError(params.id as string)
	}
}

export class SecretUpdateError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretUpdateError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretUpdateError(params.id as string)
	}
}

export class SecretDeleteError extends LocalizedError {
	public constructor(public id: string) {
		super("SecretDeleteError", { id })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretDeleteError(params.id as string)
	}
}

export class SecretParseError extends LocalizedError {
	public constructor(public issues: z.core.$ZodIssue[]) {
		super("SecretParseError", { reasons: issues.map((x) => x.message).join(", ") })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretParseError(params.issues as z.core.$ZodIssue[])
	}
}

export class SecretPolicyError extends LocalizedError {
	public override code = STATUS_CODE.Forbidden
	public constructor(public reason: string) {
		super("SecretPolicyError", { reason })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretPolicyError(params.reason as string)
	}
}

export class SecretSizeLimitError extends LocalizedError {
	public override code = STATUS_CODE.ContentTooLarge
	public constructor(public size: number, public maxSize: number) {
		super("SecretSizeLimitError", { size: humanReadableSize(size), maxSize: humanReadableSize(maxSize) })
	}

	public static fromResultFailure(_message: string, params: Record<string, unknown>): Error {
		return new SecretSizeLimitError(params.size as number, params.maxSize as number)
	}
}

/**
 * Register error types with @nihility-io/result in order to parse Results containing
 * these errors may be parsed correctly.
 */
Result.registerErrorTypes(
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
