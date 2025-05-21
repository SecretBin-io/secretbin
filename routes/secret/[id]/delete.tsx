import classNames from "classnames"
import { Button, PageContent } from "components"
import { type PageProps, PageResponse } from "fresh"
import { LocalizedError, useTranslationWithPrefix } from "lang"
import { Secrets } from "secret/server"
import { State } from "state"
import { define } from "utils"

interface DeleteSecretData {
	id: string
	done?: boolean
	error?: string
}

export const handler = define.handlers<DeleteSecretData>({
	async GET({ params }): Promise<PageResponse<DeleteSecretData>> {
		try {
			await Secrets.shared.getSecretMetadata(params.id)

			return { data: { id: params.id, done: false } }
		} catch (e) {
			return { data: { id: params.id, error: (e as Error).message, done: true } }
		}
	},
	async POST({ params, state }) {
		try {
			await Secrets.shared.deleteSecret(params.id)
			return { data: { id: params.id, done: true } }
		} catch (e) {
			return {
				data: {
					id: params.id,
					done: true,
					error: LocalizedError.getLocalizedMessage(state.language, e as Error),
				},
			}
		}
	},
})

/**
 * Renders page for deleting a secrets
 */
export default ({ data, state }: PageProps<DeleteSecretData, State>) => {
	const $ = useTranslationWithPrefix(state.language, "DeleteSecret")

	if (data.done) {
		return (
			<PageContent title={$("Title")}>
				<p
					class={classNames({
						"text-green-800 dark:text-green-400": !data.error,
						"text-red-800 dark:text-red-400": data.error,
					})}
				>
					{data.error || $("Success", { id: data.id })}
				</p>
			</PageContent>
		)
	}

	return (
		<PageContent title={$("Title")} description={$("Description", { id: data.id })}>
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
