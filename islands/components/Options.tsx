import { Checkbox, Input, NumberInput, Section, Select, Show } from "components"
import { config } from "config"
import Record from "@nihility-io/record"
import { TranslationKey, TrimPrefix, useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { SecretOptions } from "secret/client"
import { State } from "state"

export interface OptionsProps {
    state: State
    options: SecretOptions
    setOptions: (value: SecretOptions) => void
    setPassword: (value: string | undefined) => void
}

export const Options = ({ state, options, setOptions, setPassword }: OptionsProps) => {
    const $ = useTranslationWithPrefix(state.lang, "NewSecret")

    const [pass1, setPass1] = useState("")
    const [pass2, setPass2] = useState("")
    const [passInvalid, setPassInvalid] = useState(false)
    const [usePass, setUsePass] = useState(config.defaults.showPassword)

    useEffect(() => {
        console.log({ pass1, pass2 })

        if (!usePass) {
            setPassword("")
        } if (pass1 !== pass2) {
            setPassInvalid(true)
            setPassword(undefined)
        } else {
            setPassInvalid(false)
            setPassword(pass1)
        }

    }, [pass1, pass2, usePass])

    const setOpts = <K extends keyof SecretOptions,>(key: K) => (value: SecretOptions[K]) => {
        setOptions({ ...options, [key]: value })
    }

    return (
        <>
            <Section title={$("Expiration.Title")} description={$("Expiration.Description")}>
                <Select
                    options={Record.mapToArray(config.expires, (key, value) => ({
                        name: $(
                            `Expiration.Expire.${value.unit as string}.${value.count === 1 ? "One" : "Many"
                            }` as unknown as TrimPrefix<"NewSecret", TranslationKey>,
                            { count: "" + value.count },
                        ),
                        value: key,
                    }))}
                    value={options.expires}
                    onChange={setOpts("expires")}
                />
            </Section>
            <Section title={$("Options.Title")} description={$("Options.Description")}>
                <Checkbox
                    mode="toggle"
                    label={$("Options.Burn.Title")}
                    subLabel={$("Options.Burn.Description")}
                    disabled={config.policy.requireBurn}
                    tooltip={config.policy.requireBurn
                        ? $("RequiredByPolicy", { name: config.branding.appName })
                        : undefined}
                    checked={options.burn}
                    onChange={setOpts("burn")}
                />
                <Show if={!config.policy.denySlowBurn && options.burn}>
                    <>
                        <Checkbox
                            mode="toggle"
                            label={$("Options.SlowBurn.Title")}
                            subLabel={$("Options.SlowBurn.Description")}
                            checked={options.slowBurn}
                            onChange={setOpts("slowBurn")}
                        />

                        <Show if={options.slowBurn}>
                            <div class="flex mb-3">
                                <div class="flex">
                                    <div class="w-11" />
                                </div>
                                <div class="ms-2 text-sm">
                                    <NumberInput min={2} max={10} value={options.rereads} onChange={setOpts("rereads")} />
                                </div>
                                <div class="ms-2 text-sm">
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        {$("Options.SlowBurn.Status", { count: `${options.rereads}` })}
                                    </p>
                                </div>
                            </div>
                        </Show>
                    </>
                </Show>
                <Checkbox
                    mode="toggle"
                    label={$("Options.Password.Title")}
                    subLabel={$("Options.Password.Description")}
                    disabled={config.policy.requirePassword}
                    tooltip={config.policy.requirePassword
                        ? $("RequiredByPolicy", { name: config.branding.appName })
                        : undefined}
                    checked={usePass}
                    onChange={setUsePass}
                />
                <Show if={usePass}>
                    <div class="flex">
                        <div class="flex h-5">
                            <div class="w-11" />
                        </div>
                        <Input
                            class="ms-2"
                            hidden
                            value={pass1}
                            invalid={passInvalid}
                            placeholder={$("Options.Password.Placeholder")}
                            onChange={setPass1}
                        />
                        <Input
                            class="ms-2 ml-2"
                            hidden
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
                            <p class="mt-2 ml-2 mb-2 text-sm text-red-600 dark:text-red-500">
                                {$("Options.Password.Mismatch")}
                            </p>
                        </div>
                    </Show>
                </Show>
            </Section>
        </>
    )
}
