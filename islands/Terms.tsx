import { CheckIcon } from "@heroicons/react/24/outline"
import { Modal } from "components"
import { ComponentChild } from "preact"
import { useEffect, useRef } from "preact/hooks"
import { useSetting, useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface TermsProps {
	state: State
}

/**
 * Creates a modal with the usage terms
 */
export function Terms({ state }: TermsProps): ComponentChild {
	const $ = useTranslation(state.language, "TermsOfService")
	const [showTerms, setShowTerms] = useSetting("showTerms", !!state.config.branding.terms, state)
	const modalRef = useRef<HTMLDialogElement | null>(null)

	useEffect(() => {
		showTerms ? modalRef.current?.showModal() : modalRef.current?.close()
	}, [showTerms])

	if (state.config.branding.terms === undefined) {
		return undefined
	}

	return (
		<Modal
			dialogRef={modalRef}
			title={
				state.config.branding.terms?.title[state.language] ?? // Get title from config in the desired language
				state.config.branding.terms?.title.en ?? // If not found try to get title from config in English
				$("Title") // If not found either use default from translation files
			}
			actions={[
				{
					label: $("Accept"),
					icon: CheckIcon,
					theme: "success",
					outline: true,
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
					__html: state.config.branding.terms.content[state.language] ?? // Get content from config in the desired language
						state.config.branding.terms.content.en, // If not found try to get title from config in English
				}}
			/>
		</Modal>
	)
}
