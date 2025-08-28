import { Button, PageContent } from "components"
import { PageResponse } from "fresh"
import { useTranslationWithPrefix } from "lang"
import { Secrets } from "secret/server"
import { define } from "utils"

interface DeleteSecretData {
	id: string
	done: boolean
}

export const handler = define.handlers({
	async GET({ params: { id } }): Promise<PageResponse<DeleteSecretData>> {
		await Secrets.shared.getSecretMetadata(id)
		return { data: { id, done: false } }
	},
	async POST({ params: { id } }): Promise<PageResponse<DeleteSecretData>> {
		await Secrets.shared.deleteSecret(id)
		return { data: { id, done: true } }
	},
})

/**
 * Renders page for deleting a secrets
 */
export default define.page<typeof handler>(({ state, data: { id, done } }) => {
	const $ = useTranslationWithPrefix(state.language, "DeleteSecret")

	if (done) {
		return (
			<PageContent title={$("Title")}>
				<p class="text-green-800 dark:text-green-400">
					{$("Success", { id })}
				</p>
			</PageContent>
		)
	}

	return (
		<PageContent title={$("Title")} description={$("Description", { id })}>
			<form method="post">
				<div class="items-left justify-left space-y-4 sm:space-x-4 sm:space-y-0 rtl:space-x-reverse">
					<div class="mx-auto">
						<Button type="submit" label={$("Delete")} />
					</div>
				</div>
			</form>
		</PageContent>
	)
})
