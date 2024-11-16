import { Cookies } from "@nihility-io/cookies"
import { Modal } from "components"
import { config } from "config"
import { type ModalInterface } from "flowbite"
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

	return (
		<Modal
			modelRef={(modal: ModalInterface) => {
				// Show terms if not already excepted
				if (Cookies.get<string>("terms", "") !== "accepted") {
					modal.show()
				}
			}}
			title={
				config.branding.terms?.title[state.lang] ?? // Get title from config in the desired language
				config.branding.terms?.title.en ?? // If not found try to get title from config in English
				$("Title") // If not found either use default from translation files
			}
			actions={[
				{
					name: $("Accept"),
					onClick: (m) => {
						// If terms were accepted, dismiss modal and remember that the terms were accepted using a cookie
						Cookies.set("terms", "accepted", { expires: 3650 })
						m.hide()
					},
				},
			]}
		>
			<div
				dangerouslySetInnerHTML={{
					__html: config.branding.terms?.content[state.lang] ?? // Get content from config in the desired language
						config.branding.terms?.content.en ?? // If not found try to get title from config in English
						$("Content", { name: config.branding.appName }), // If not found either use default from translation files
				}}
			/>
		</Modal>
	)
}
