import { Button, Message, PageContent } from "components"
import { HttpError, type PageProps } from "fresh"
import { LocalizedError, useTranslationWithPrefix } from "lang"
import { State } from "state"

export default ({ state, error }: PageProps<unknown, State>) => {
	const $ = useTranslationWithPrefix(state.language, "ErrorPage")

	let title = "Error"
	let message = ""

	switch (true) {
		case error instanceof LocalizedError: {
			title = error.getTitle(state.language)
			message = error.getMessage(state.language)
			break
		}
		case error instanceof HttpError && error.status === 404: {
			const $err = useTranslationWithPrefix(state.language, "Errors.PageNotFoundError")
			title = $err("Title")
			message = $err("Message")
			break
		}
		case error instanceof Error: {
			title = error.name
			message = error.message
			break
		}
		default: {
			title = $("Title")
			message = `${error}`
		}
	}

	return (
		<PageContent title={title}>
			<Message type="error" largeText>
				{message}
			</Message>
			<Button label={$("GoHome")} link="/" />
		</PageContent>
	)
}
