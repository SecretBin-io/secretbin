import { Message, PageContent } from "components"
import { type PageProps, PageResponse } from "fresh"
import { Expires, ViewSecret } from "islands"
import { useTranslationWithPrefix } from "lang"
import { Secrets } from "secret/server"
import { State } from "state"
import { SecretMetadata } from "secret/models"
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
export default ({ state, data: { id, metadata } }: PageProps<GetSecretData, State>) => {
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
}
