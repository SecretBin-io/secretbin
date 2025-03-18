import { NewSecret } from "islands"
import { Button, PageContent } from "components"
import { useTranslationWithPrefix } from "lang"
import { type PageProps } from "fresh"
import { State } from "state"

/**
 * Entry page. Used for created new secrets
 */
export default ({ state }: PageProps<unknown, State>) => {
	const $ = useTranslationWithPrefix(state.lang, "NewSecret")

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
				<div class="mx-auto">
					<NewSecret state={state} />
				</div>
			</div>
		</PageContent>
	)
}
