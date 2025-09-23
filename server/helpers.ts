import { SecretSubmission } from "models"
import { config } from "server/config"
import { SecretParseError, SecretPolicyError, SecretSizeLimitError } from "utils/errors"

/**
 * Converts a duration into an expiration date.
 * If the duration is invalid, throws an error.
 * @param duration Duration e.g. 5min
 * @returns Expiration date
 */
export function getExpireDate(duration: string): Date {
	// Check if the duration is an configured duration and
	// converts the duration into seconds
	const s = config.expires[duration].seconds
	if (!s) {
		throw new SecretParseError([{
			code: "custom",
			input: duration,
			path: ["expires"],
			message: `${duration} is not a valid value. Use one of the following: ${
				Object.keys(config.expires).join(", ")
			}`,
		}])
	}

	// Add the duration to the current time
	return new Date(new Date().getTime() + s * 1000)
}

/**
 * Ensures that the provided secret meets the configured policies.
 * If not, an error is thrown.
 * @param secret Secret to check
 */
export function assertMeetsPolicy(secret: SecretSubmission): void {
	const data = secret.dataBytes ? secret.dataBytes : secret.data
	if (data.length > config.storage.maxSize) {
		throw new SecretSizeLimitError(data.length, config.storage.maxSize)
	}

	// Ensure that the secrets fulfills the configured policies
	if (config.policy.denySlowBurn && secret.burnAfter > 1) {
		throw new SecretPolicyError(`Slow burn is not allowed.`)
	}

	if (config.policy.requireBurn && secret.burnAfter === -1) {
		throw new SecretPolicyError(`Burn is required.`)
	}

	if (config.policy.requirePassword && !secret.passwordProtected) {
		throw new SecretPolicyError(`Password is required.`)
	}
}
