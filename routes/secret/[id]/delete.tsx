import classNames from "classnames"
import { Button, Message, PageContent } from "components"
import { type PageProps, PageResponse } from "fresh"
import { useTranslationWithPrefix } from "lang"
import { LocalizedError } from "secret/models"
import { Secrets } from "secret/server"
import { State } from "state"
import { define } from "utils"

interface DeleteSecretData {
	id: string
	done?: boolean
	error?: string
}

export const handler = define.handlers<DeleteSecretData>({
	async GET({ params }) {
		const res = await Secrets.shared.getSecretMetadata(params.id)

		return {
			data: { id: params.id, error: res.isFailure() ? res.error.message : undefined, done: res.isFailure() },
		} satisfies PageResponse<DeleteSecretData>
	},
	async POST({ params, state }) {
		const res = await Secrets.shared.deleteSecret(params.id)
		return res.match<PageResponse<DeleteSecretData>>({
			success: () => ({
				data: { id: params.id, done: true },
			}),
			failure: (error) => ({
				data: {
					id: params.id,
					done: true,
					error: LocalizedError.getLocalizedMessage(state.lang, error),
				},
			}),
		})
	},
})

/**
 * Renders page for deleting a secrets
 */
export default ({ data, state }: PageProps<DeleteSecretData, State>) => {
	const $ = useTranslationWithPrefix(state.lang, "DeleteSecret")

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
