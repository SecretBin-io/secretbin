import { EncryptionAlgorithm } from "@nihility-io/crypto"
import z, { ZodType } from "zod"

/**
 * Set enforced usage policy for new secrets
 */
export interface Policy {
	/** Pre-selects the link in the share view */
	sharePreselect: boolean

	/** Forces users to enable the burn option for new secrets */
	requireBurn: boolean

	/** Forces users to specify a password for new secrets */
	requirePassword: boolean

	/** Blocks users from enabling slow burn for new secrets */
	denySlowBurn: boolean

	/** Algorithm used for encrypting new secrets */
	encryptionAlgorithm: EncryptionAlgorithm
}

export const Policy: ZodType<Policy> = z.strictInterface({
	sharePreselect: z.boolean().default(false),
	requireBurn: z.boolean().default(false),
	requirePassword: z.boolean().default(false),
	denySlowBurn: z.boolean().default(false),
	encryptionAlgorithm: z.enum(EncryptionAlgorithm).default(EncryptionAlgorithm.AES256GCM),
})
