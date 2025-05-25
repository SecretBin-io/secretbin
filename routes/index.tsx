import { PageContent } from "components"
import { type PageProps } from "fresh"
import { NewSecret } from "islands"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { State } from "state"

/**
 * Entry page. Used for created new secrets
 */
export default function Index({ state }: PageProps<unknown, State>): JSX.Element {
	const $ = useTranslationWithPrefix(state.language, "NewSecret")

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
