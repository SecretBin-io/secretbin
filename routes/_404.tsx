import { PageContent } from "components"
import { type PageProps } from "fresh"
import { useTranslationWithPrefix } from "lang"
import { State } from "state"

export default ({ state }: PageProps<unknown, State>) => {
	const $ = useTranslationWithPrefix(state.language, "ErrorPage.NotFound")
	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<a href="/" class="underline">{$("GoHome")}</a>
		</PageContent>
	)
}
