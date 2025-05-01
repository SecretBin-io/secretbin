import { useCookie } from "@nihility-io/cookies"
import { Button, Input, Modal, NumberInput, Section, Toggle } from "components"
import { useTranslationWithPrefix } from "lang"
import { useState } from "preact/hooks"
import { generatePassword } from "secret/client"
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

export const PasswordGenerator = ({ show, onDismiss, onPassword, state }: PasswordGeneratorProps) => {
	const $ = useTranslationWithPrefix(state.lang, "PasswordGenerator")
	const [password, setPassword] = useState("")
	const [useUppercase, setUseUppercase] = useCookie("password-use-uppercase", true, { expires: 3650 })
	const [useLowercase, setUseLowercase] = useCookie("password-use-lowercase", true, { expires: 3650 })
	const [useDigits, setUseDigits] = useCookie("password-use-digits", true, { expires: 3650 })
	const [useSymbols, setUseSymbols] = useCookie("password-use-symbols", true, { expires: 3650 })
	const [passwordLength, setPasswordLength] = useCookie("password-length", 12, { expires: 3650 })

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
			onDismiss={onDismiss}
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
