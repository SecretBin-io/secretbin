import { Button, Message, PageContent, Show } from "components"
import { Context } from "context"
import { useTranslationWithPrefix } from "lang"
import { useRef, useState } from "preact/hooks"
import { deleteSecret } from "secret/client"
import { LocalizedError } from "secret/models"

export interface DeleteSecretProps {
	id: string
	ctx: Context
}

export const DeleteSecret = ({ id, ctx }: DeleteSecretProps) => {
	const $ = useTranslationWithPrefix(ctx.lang, "DeleteSecret")
	const [error, setError] = useState("")

	const aRef = useRef<HTMLAnchorElement | null>(null)

	const onDelete = async () => {
		const res = await deleteSecret(id)
		if (res.isFailure()) {
			setError(LocalizedError.getLocalizedMessage(ctx.lang, res.error))
			return
		}

		aRef.current!.href = "/"
		aRef.current!.click()
	}

	return (
		<PageContent title={$("Title")} description={$("Description", { id })}>
			<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
				<div class="mx-auto">
					<Button label={$("Delete")} onClick={onDelete} />
				</div>
			</div>
			<Show if={error !== ""}>
				<Message type="error" title="Error" message={error} />
			</Show>
			{/* This line is necessary in order to use Deno Fresh Partials. Partials only work when navigating using links. */}
			<a class="hidden" ref={aRef} href="" />
		</PageContent>
	)
}
