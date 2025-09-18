import { clsx } from "@nick/clsx"
import { Message, Show } from "components"
import { Partial } from "fresh/runtime"
import { NavMenu, Terms } from "islands"
import { define } from "utils"
import { useTranslation } from "utils/hooks"

export default define.layout(({ state, Component }) => {
	const $ = useTranslation(state.language)

	return (
		<div f-client-nav>
			<Terms state={state} />

			<nav class="navbar fixed top-0 z-100 bg-base-200/75 backdrop-blur-sm">
				<div class="flex-1 md:ms-6">
					<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
						<Show if={state.config.branding.showLogo}>
							<img
								class={clsx("h-8", { "dark:invert": state.config.branding.invertLogo })}
								src="/images/Icon.png"
							/>
						</Show>
						<span class="self-center whitespace-nowrap font-semibold text-2xl dark:text-white">
							{state.config.branding.appName}
						</span>
					</a>
				</div>
				<div class="flex-none md:me-6">
					<NavMenu state={state} />
				</div>
			</nav>

			<main class="mx-auto my-20">
				{/* Show banner e.g. for planned maintenance message if configured */}
				<Show if={state.config.banner.enabled}>
					<div class="mx-auto">
						<div class="mx-auto flex max-w-screen-md flex-col items-center justify-center">
							<div class="w-full p-4">
								<Message
									type={state.config.banner.type}
									title={state.config.branding.appName}
									message={state.config.banner.text[state.language] ??
										state.config.banner.text.en}
								/>
							</div>
						</div>
					</div>
				</Show>

				{/* Show warning if browser is not supported */}
				<Show if={!state.supportedBrowser}>
					<div class="mx-auto">
						<div class="mx-auto flex max-w-screen-md flex-col items-center justify-center">
							<div class="w-full p-4">
								<Message
									type="warning"
									title={state.config.branding.appName}
									message={$("Common.UnsupportedBrowser", {
										browsers: state.supportedBrowsers,
									})}
								/>
							</div>
						</div>
					</div>
				</Show>

				<Partial name="content">
					<Component />
				</Partial>
			</main>

			{/* Add footer with configured links */}
			<footer class="navbar fixed bottom-0 bg-base-200/75 backdrop-blur-sm">
				<div class="flex-1 md:ms-6">
					<span class="text-gray-500 text-sm sm:text-center dark:text-gray-400">
						{state.config.branding.footer}
					</span>
				</div>
				<div class="flex-none md:me-6">
					<ul class="menu menu-horizontal px-1">
						{state.config.branding.links.map((link) => (
							<li>
								<a
									class="me-4 md:me-6"
									target="_blank"
									href={link.link[state.language] ?? link.link.en}
								>
									{link.name[state.language] ?? link.name.en}
								</a>
							</li>
						))}
						<li>
							<a class="me-4 md:me-6" href="/credits">
								{$("Credits.Title")}
							</a>
						</li>
					</ul>
				</div>
			</footer>
		</div>
	)
})
