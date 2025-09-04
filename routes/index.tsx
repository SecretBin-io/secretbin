import { PageContent } from "components"
import { NewSecret } from "islands"
import { define } from "utils"
import { useTranslation } from "utils/hooks"

/**
 * Entry page. Used for created new secrets
 */
export default define.page(({ state }) => {
	const $ = useTranslation(state.language, "NewSecret")

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-x-4 sm:space-y-0 rtl:space-x-reverse">
				<div class="mx-auto">
					<NewSecret state={state} />
				</div>
			</div>
		</PageContent>
	)
})
