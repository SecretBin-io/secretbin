import { useCookie } from "@nihility-io/cookies"
import { Modal } from "components"
import { config } from "config"
import { useTranslationWithPrefix } from "lang"
import { State } from "state"

export interface TermsProps {
	state: State
}

/**
 * Creates a modal with the usage terms
 */
export const Terms = ({ state }: TermsProps) => {
	const $ = useTranslationWithPrefix(state.lang, "TermsOfService")
	const [terms, setTerms] = useCookie("terms", "", { expires: 3650 })

	return (
		<Modal
			show={terms !== "accepted"}
			title={
				config.branding.terms?.title[state.lang] ?? // Get title from config in the desired language
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
						setTerms("accepted")
					},
				},
			]}
		>
			<div
				class="max-h-80 overflow-y-scroll"
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: config.branding.terms?.content[state.lang] ?? // Get content from config in the desired language
						config.branding.terms?.content.en ?? // If not found try to get title from config in English
						$("Content", { name: config.branding.appName }), // If not found either use default from translation files
				}}
			/>
		</Modal>
	)
}
