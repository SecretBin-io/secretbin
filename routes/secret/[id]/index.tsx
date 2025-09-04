import { PageContent } from "components"
import { PageResponse } from "fresh"
import { Expires, ViewSecret } from "islands"
import { SecretMetadata } from "models"
import { Secrets } from "server"
import { define } from "utils"
import { useTranslation } from "utils/hooks"

interface GetSecretData {
	id: string
	metadata: SecretMetadata
}

export const handler = define.handlers<GetSecretData>({
	async GET({ params: { id } }): Promise<PageResponse<GetSecretData>> {
		const metadata = await Secrets.shared.getSecretMetadata(id)
		return { data: { id, metadata } }
	},
})

/**
 * Renders page for viewing a secret
 */
export default define.page<typeof handler>(({ state, data: { id, metadata } }) => {
	const $ = useTranslation(state.language, "ViewSecret")

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-x-4 sm:space-y-0 rtl:space-x-reverse">
				<div class="mx-auto">
					<Expires state={state} date={metadata.expires} />
					<ViewSecret
						state={state}
						id={id}
						remainingReads={metadata.remainingReads}
						passwordProtected={metadata.passwordProtected}
					/>
				</div>
			</div>
		</PageContent>
	)
})
