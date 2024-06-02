import { Cookies } from "@nihility-io/use-cookie"
import { Modal } from "components"
import { config } from "config"
import { Context } from "context"
import { ModalInterface } from "flowbite"
import { useLanguage, useTranslationWithPrefix } from "lang"

export interface TermsProps {
	ctx: Context
}

/**
 * Creates a modal with the usage terms
 */
export const Terms = ({ ctx }: TermsProps) => {
	const $ = useTranslationWithPrefix(ctx.lang, "TermsOfService")
	const [lang] = useLanguage(ctx.lang)

	return (
		<Modal
			modelRef={(modal: ModalInterface) => {
				// Show terms if not already excepted
				if (Cookies.get<string>("terms", "") !== "accepted") {
					modal.show()
				}
			}}
			title={
				config.branding.terms?.title[lang] ?? // Get title from config in the desired language
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
					__html: config.branding.terms?.content[lang] ?? // Get content from config in the desired language
						config.branding.terms?.content.en ?? // If not found try to get title from config in English
						$("Content", { name: config.branding.appName }), // If not found either use default from translation files
				}}
			/>
		</Modal>
	)
}
