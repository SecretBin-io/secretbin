import Record from "@nihility-io/record"
import { Input, NumberInput, Section, Select, SelectOption, Show, Toggle } from "components"
import { TranslationKey } from "lang"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { TrimPrefix } from "utils/helpers"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface OptionsProps {
	state: State

	expires: string
	setExpires: (value: string) => void

	burn: boolean
	setBurn: (value: boolean) => void

	slowBurn: boolean
	setSlowBurn: (value: boolean) => void

	rereads: number
	setRereads: (value: number) => void

	setPassword: (value: string | undefined) => void
}

export function Options({
	state,
	expires,
	setExpires,
	burn,
	setBurn,
	slowBurn,
	setSlowBurn,
	rereads,
	setRereads,
	setPassword,
}: OptionsProps): JSX.Element {
	const $ = useTranslation(state.language, "NewSecret")

	const [pass1, setPass1] = useState("")
	const [pass2, setPass2] = useState("")
	const [passInvalid, setPassInvalid] = useState(false)
	const [usePass, setUsePass] = useState(state.config.defaults.showPassword)

	useEffect(() => {
		if (!usePass) {
			setPassword("")
		}
		if (pass1 !== pass2) {
			setPassInvalid(true)
			setPassword(undefined)
		} else {
			setPassInvalid(false)
			setPassword(pass1)
		}
	}, [pass1, pass2, usePass])

	return (
		<>
			<Section title={$("Expiration.Title")} description={$("Expiration.Description")}>
				<Select value={expires} onChange={setExpires}>
					{Record.mapToArray(state.config.expires, (key, value) => (
						<SelectOption
							name={$(
								`Expiration.Expire.${value.unit as string}.${
									value.count === 1 ? "One" : "Many"
								}` as unknown as TrimPrefix<"NewSecret", TranslationKey>,
								{ count: "" + value.count },
							)}
							value={key}
						/>
					))}
				</Select>
			</Section>
			<Section title={$("Options.Title")} description={$("Options.Description")}>
				<Toggle
					label={$("Options.Burn.Title")}
					subLabel={$("Options.Burn.Description")}
					disabled={state.config.policy.requireBurn}
					tooltip={state.config.policy.requireBurn
						? $("RequiredByPolicy", { name: state.config.branding.appName })
						: undefined}
					on={state.config.policy.requireBurn || burn}
					onChange={setBurn}
				/>
				<Show if={!state.config.policy.denySlowBurn && burn}>
					<Toggle
						label={$("Options.SlowBurn.Title")}
						subLabel={$("Options.SlowBurn.Description")}
						on={slowBurn}
						onChange={setSlowBurn}
					/>

					<Show if={slowBurn}>
						<div class="mb-3 flex">
							<div class="flex">
								<div class="w-11" />
							</div>
							<div class="ms-2 text-sm">
								<NumberInput
									min={2}
									max={10}
									value={rereads}
									onChange={setRereads}
								/>
							</div>
							<div class="ms-2 text-sm">
								<p class="text-gray-500 text-sm dark:text-gray-400">
									{$("Options.SlowBurn.Status", { count: `${rereads}` })}
								</p>
							</div>
						</div>
					</Show>
				</Show>
				<Toggle
					label={$("Options.Password.Title")}
					subLabel={$("Options.Password.Description")}
					disabled={state.config.policy.requirePassword}
					tooltip={state.config.policy.requirePassword
						? $("RequiredByPolicy", { name: state.config.branding.appName })
						: undefined}
					on={state.config.policy.requirePassword || usePass}
					onChange={setUsePass}
				/>
				<Show if={state.config.policy.requirePassword || usePass}>
					<div class="flex">
						<div class="flex h-5">
							<div class="w-11" />
						</div>
						<Input
							class="ms-2"
							password
							value={pass1}
							invalid={passInvalid}
							placeholder={$("Options.Password.Placeholder")}
							onChange={setPass1}
						/>
						<Input
							class="ms-2 ml-2"
							password
							value={pass2}
							invalid={passInvalid}
							placeholder={$("Options.Password.RepeatPlaceholder")}
							onChange={setPass2}
						/>
					</div>
					<Show if={passInvalid}>
						<div class="flex">
							<div class="flex h-5">
								<div class="w-11" />
							</div>
							<p class="mt-2 mb-2 ml-2 text-red-600 text-sm dark:text-red-500">
								{$("Options.Password.Mismatch")}
							</p>
						</div>
					</Show>
				</Show>
			</Section>
		</>
	)
}
