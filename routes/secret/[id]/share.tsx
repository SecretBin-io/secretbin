import { PageContent } from "components"
import { PageResponse } from "fresh"
import { Expires, ShareSecret } from "islands"
import { SecretMetadata } from "models"
import { Secrets } from "server"
import { define } from "utils"
import { useTranslation } from "utils/hooks"

interface ShareSecretData {
	id: string
	metadata: SecretMetadata
}

export const handler = define.handlers<ShareSecretData>({
	async GET({ params: { id } }): Promise<PageResponse<ShareSecretData>> {
		const metadata = await Secrets.shared.getSecretMetadata(id)
		return { data: { id, metadata } }
	},
})

/**
 * Renders page for sharing a secret
 */
export default define.page<typeof handler>(({ state, data: { id, metadata } }) => {
	const $ = useTranslation(state.language, "ShareSecret")
	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-x-4 sm:space-y-0 rtl:space-x-reverse">
				<div class="mx-auto">
					<Expires state={state} date={metadata.expires} />
					<ShareSecret state={state} id={id} />
				</div>
			</div>
		</PageContent>
	)
})
