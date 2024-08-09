import { TrimPrefix } from "@nihility-io/fresh-lang"
import Record from "@nihility-io/record"
import Result from "@nihility-io/result"
import {
	Button,
	Checkbox,
	FileList,
	Input,
	Message,
	NumberInput,
	PageContent,
	Section,
	Select,
	Show,
	TextArea,
	Upload,
} from "components"
import { config } from "config"
import { Context } from "context"
import { TranslationKey, useTranslationWithPrefix } from "lang"
import { useRef, useState } from "preact/hooks"
import { submitSecret } from "secret/client"
import { LocalizedError } from "secret/models"

export interface NewSecretProps {
	ctx: Context
}

// Prefill with data for easier testing
const DEMO_MODE = false

export const NewSecret = ({ ctx }: NewSecretProps) => {
	const [message, setMessage] = useState(DEMO_MODE ? "Hello World 🥳" : "")
	const [files, setFiles] = useState<File[]>([])
	const [usePassword, setUsePassword] = useState(config.defaults.showPassword)
	const [password, setPassword] = useState(DEMO_MODE ? "abc123" : "")
	const [passwordRepeat, setPasswordRepeat] = useState(DEMO_MODE ? "abc123" : "")
	const [expires, setExpires] = useState(config.defaults.expires)
	const [burn, setBurn] = useState(config.policy.requireBurn ? true : config.defaults.burn)
	const [slowBurn, setSlowBurn] = useState(false)
	const [rereads, setRereads] = useState(2)
	const [error, setError] = useState("")
	const aRef = useRef<HTMLAnchorElement | null>(null)

	const $ = useTranslationWithPrefix(ctx.lang, "NewSecret")

	const passwordInvalid = usePassword && (password !== "" || passwordRepeat !== "") && password !== passwordRepeat

	const submit = async () => {
		if (passwordInvalid) {
			return
		}

		console.log(files)

		// Submit the secret to the backend
		await submitSecret(message, files, usePassword ? password : "", {
			expires,
			burn,
			slowBurn,
			rereads,
		}).then(Result.match({
			success: (value) => {
				// If successful automatically redirect to the share page
				setError("")
				aRef.current!.href = value
				aRef.current!.click()
			},
			failure: (err) => setError(LocalizedError.getLocalizedMessage(ctx.lang, err)),
		}))
	}

	return (
		<PageContent title={$("Title")} description={$("Description")}>
			<div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
				<div class="mx-auto">
					<TextArea id="note" tabs lines={10} placeholder="" value={message} onChange={setMessage} />

					<br />

					<Section
						title={$("Files.Title")}
						description={$("Files.Description", { size: "" + (config.storage.maxSize / 1000000) })}
					>
						<Upload
							multiple
							text={$("Files.DragAndDrop")}
							onFileAdded={(x) => setFiles([...files, x])}
						/>
						<FileList files={files} onDelete={(x) => setFiles(files.filter((y) => y !== x))} />
					</Section>

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
							value={expires}
							onChange={setExpires}
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
							checked={burn}
							onChange={setBurn}
						/>
						<Show if={!config.policy.denySlowBurn && burn}>
							<>
								<Checkbox
									mode="toggle"
									label={$("Options.SlowBurn.Title")}
									subLabel={$("Options.SlowBurn.Description")}
									checked={slowBurn}
									onChange={setSlowBurn}
								/>

								<Show if={slowBurn}>
									<div class="flex mb-3">
										<div class="flex">
											<div class="w-11" />
										</div>
										<div class="ms-2 text-sm">
											<NumberInput min={2} max={10} value={rereads} onChange={setRereads} />
										</div>
										<div class="ms-2 text-sm">
											<p class="text-sm text-gray-500 dark:text-gray-400">
												{$("Options.SlowBurn.Status", { count: `${rereads}` })}
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
							checked={usePassword}
							onChange={setUsePassword}
						/>
						<Show if={usePassword}>
							<div class="flex">
								<div class="flex h-5">
									<div class="w-11" />
								</div>
								<Input
									class="ms-2"
									hidden
									value={password}
									invalid={passwordInvalid}
									placeholder={$("Options.Password.Placeholder")}
									onChange={setPassword}
								/>
								<Input
									class="ms-2 ml-2"
									hidden
									value={passwordRepeat}
									invalid={passwordInvalid}
									placeholder={$("Options.Password.RepeatPlaceholder")}
									onChange={setPasswordRepeat}
								/>
							</div>
							<Show if={passwordInvalid}>
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

					<Show if={error !== ""}>
						<Message type="error" title="Error" message={error} />
					</Show>
					<Button class="float-right" label={$("Create")} onClick={submit} />
					{/* This line is necessary in order to use Deno Fresh Partials. Partials only work when navigating using links. */}
					<a class="hidden" ref={aRef} href="" />
				</div>
			</div>
		</PageContent>
	)
}
