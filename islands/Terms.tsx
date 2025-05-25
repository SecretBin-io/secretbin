import { Modal } from "components"
import { config } from "config"
import { useSetting } from "helpers"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { State } from "state"

export interface TermsProps {
	state: State
}

/**
 * Creates a modal with the usage terms
 */
export function Terms({ state }: TermsProps): JSX.Element | undefined {
	const $ = useTranslationWithPrefix(state.language, "TermsOfService")
	const [showTerms, setShowTerms] = useSetting("showTerms", !!config.branding.terms, state)

	if (config.branding.terms === undefined) {
		return undefined
	}

	return (
		<Modal
			show={showTerms}
			title={
				config.branding.terms?.title[state.language] ?? // Get title from config in the desired language
					config.branding.terms?.title.en ?? // If not found try to get title from config in English
					$("Title") // If not found either use default from translation files
			}
			actions={[
				{
					label: $("Accept"),
					icon: "Check",
					theme: "plainSuccess",
					onClick: () => {
						// If terms were accepted, dismiss modal and remember that the terms were accepted using a cookie
						setShowTerms(false)
					},
				},
			]}
		>
			<div
				class="max-h-80 overflow-y-scroll"
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: config.branding.terms.content[state.language] ?? // Get content from config in the desired language
						config.branding.terms.content.en, // If not found try to get title from config in English
				}}
			/>
		</Modal>
	)
}
