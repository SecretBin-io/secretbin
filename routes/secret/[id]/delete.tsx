import { Button, PageContent } from "components"
import { type PageProps, PageResponse } from "fresh"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { Secrets } from "secret/server"
import { State } from "state"
import { define } from "utils"

interface DeleteSecretData {
	id: string
	done?: boolean
}

export const handler = define.handlers<DeleteSecretData>({
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
export default ({ state, data: { id, done } }: PageProps<DeleteSecretData, State>): JSX.Element => {
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
				<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
					<div class="mx-auto">
						<Button type="submit" label={$("Delete")} />
					</div>
				</div>
			</form>
		</PageContent>
	)
}
