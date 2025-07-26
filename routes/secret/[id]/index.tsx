import { PageContent } from "components"
import { PageResponse } from "fresh"
import { Expires, ViewSecret } from "islands"
import { useTranslationWithPrefix } from "lang"
import { SecretMetadata } from "secret/models"
import { Secrets } from "secret/server"
import { define } from "utils"

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
	const $ = useTranslationWithPrefix(state.language, "ViewSecret")

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
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
