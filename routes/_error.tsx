import { Button, Message, PageContent } from "components"
import { HttpError } from "fresh"
import { define } from "utils"
import { LocalizedError } from "utils/errors"
import { useTranslation } from "utils/hooks"

export default define.page(({ state, error }) => {
	const $ = useTranslation(state.language, "ErrorPage")

	let title = "Error"
	let message = ""
	let reason = ""

	switch (true) {
		case error instanceof LocalizedError: {
			title = error.getTitle(state.language)
			message = error.getMessage(state.language)
			reason = error.getReason(state.language) ?? ""
			break
		}
		case error instanceof HttpError && error.status === 404: {
			const $err = useTranslation(state.language, "Errors.PageNotFoundError")
			title = $err("Title")
			message = $err("Message")
			break
		}
		case error instanceof Error: {
			title = (error as Error).name
			message = (error as Error).message
			break
		}
		default: {
			title = $("Title")
			message = `${error}`
		}
	}

	return (
		<PageContent title={title}>
			<Message class="my-2" type="error" largeText>
				<h3 class="font-bold">{message}</h3>
				{reason && (
					<div class="text-s">
						{$("Reason", { reason })}
					</div>
				)}
			</Message>
			<Button label={$("GoHome")} link="/" />
		</PageContent>
	)
})
