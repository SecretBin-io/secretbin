import { PageContent } from "components"
import { PagePropsWithContext } from "context"
import { useTranslationWithPrefix } from "lang"

export default ({ state: ctx }: PagePropsWithContext) => {
	const $ = useTranslationWithPrefix(ctx.lang, "ErrorPage.NotFound")
	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<a href="/" class="underline">{$("GoHome")}</a>
		</PageContent>
	)
}
