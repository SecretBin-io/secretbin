import { generatePassword } from "@nihility-io/crypto"
import { Button, Input, Modal, NumberInput, Section, Toggle } from "components"
import { JSX } from "preact"
import { useState } from "preact/hooks"
import { useSettingSignal, useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface PasswordGeneratorProps {
	state: State

	/** Set the visibility state of the modal */
	show?: boolean

	/** Function called when the modal is closed */
	onDismiss?: () => void

	/** Function called when user generated a password they want to use */
	onPassword: (password: string) => void
}

export function PasswordGenerator({ show, onDismiss, onPassword, state }: PasswordGeneratorProps): JSX.Element {
	const $ = useTranslation(state.language, "PasswordGenerator")
	const [password, setPassword] = useState("")
	const useUppercase = useSettingSignal("passwords.useUppercase", true, state)
	const useLowercase = useSettingSignal("passwords.useLowercase", true, state)
	const useDigits = useSettingSignal("passwords.useDigits", true, state)
	const useSymbols = useSettingSignal("passwords.useSymbols", true, state)
	const passwordLength = useSettingSignal("passwords.length", 12, state)

	const onGenerate = () => {
		setPassword(
			generatePassword({
				useUppercase: useUppercase.value,
				useLowercase: useLowercase.value,
				useDigits: useDigits.value,
				useSymbols: useSymbols.value,
				length: passwordLength.value,
			}),
		)
	}

	const onInsert = () => {
		onPassword(password)
		setPassword("")
	}

	return (
		<Modal
			title={$("Title")}
			show={show}
			onClose={onDismiss}
			actions={[
				{ label: $("Insert"), disabled: password === "", onClick: onInsert },
			]}
		>
			<p>{$("Description")}</p>
			<div class="flex">
				<Input readOnly value={password} />
				<Button class="!mb-0 ml-2" label={$("Generate")} onClick={onGenerate} />
			</div>
			<Section title={$("Length")}>
				<NumberInput min={6} max={64} signal={passwordLength} />
			</Section>
			<Section title={$("Characters.Title")} description={$("Characters.Description")}>
				<Toggle
					label={$("Characters.Uppercase.Title")}
					subLabel={$("Characters.Uppercase.Description")}
					signal={useUppercase}
				/>
				<Toggle
					label={$("Characters.Lowercase.Title")}
					subLabel={$("Characters.Lowercase.Description")}
					signal={useLowercase}
				/>
				<Toggle
					label={$("Characters.Digits.Title")}
					subLabel={$("Characters.Digits.Description")}
					signal={useDigits}
				/>
				<Toggle
					label={$("Characters.Symbols.Title")}
					subLabel={$("Characters.Symbols.Description")}
					signal={useSymbols}
				/>
			</Section>
		</Modal>
	)
}
