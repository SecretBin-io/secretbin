import { generatePassword } from "@nihility-io/crypto"
import { Button, Input, Modal, NumberInput, Section, Toggle } from "components"
import { useSetting } from "helpers"
import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { useState } from "preact/hooks"
import { State } from "state"

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
	const $ = useTranslationWithPrefix(state.language, "PasswordGenerator")
	const [password, setPassword] = useState("")
	const [useUppercase, setUseUppercase] = useSetting("passwords.useUppercase", true, state)
	const [useLowercase, setUseLowercase] = useSetting("passwords.useLowercase", true, state)
	const [useDigits, setUseDigits] = useSetting("passwords.useDigits", true, state)
	const [useSymbols, setUseSymbols] = useSetting("passwords.useSymbols", true, state)
	const [passwordLength, setPasswordLength] = useSetting("passwords.length", 12, state)

	const onGenerate = () => {
		setPassword(generatePassword({ useUppercase, useLowercase, useDigits, useSymbols, length: passwordLength }))
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
				<NumberInput min={6} max={64} value={passwordLength} onChange={setPasswordLength} />
			</Section>
			<Section title={$("Characters.Title")} description={$("Characters.Description")}>
				<Toggle
					label={$("Characters.Uppercase.Title")}
					subLabel={$("Characters.Uppercase.Description")}
					on={useUppercase}
					onChange={setUseUppercase}
				/>
				<Toggle
					label={$("Characters.Lowercase.Title")}
					subLabel={$("Characters.Lowercase.Description")}
					on={useLowercase}
					onChange={setUseLowercase}
				/>
				<Toggle
					label={$("Characters.Digits.Title")}
					subLabel={$("Characters.Digits.Description")}
					on={useDigits}
					onChange={setUseDigits}
				/>
				<Toggle
					label={$("Characters.Symbols.Title")}
					subLabel={$("Characters.Symbols.Description")}
					on={useSymbols}
					onChange={setUseSymbols}
				/>
			</Section>
		</Modal>
	)
}
