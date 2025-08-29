import { clsx } from "@nick/clsx"
import { Message, Show } from "components"
import { config } from "config"
import { asset, Partial } from "fresh/runtime"
import { NavMenu, Terms } from "islands"
import { useTranslation } from "lang"
import { Theme } from "state"
import { define } from "utils"
/**
 * Wrapper for all pages. Providers header info and navigation
 */
export default define.page(({ state, Component }) => {
	const $ = useTranslation(state.language)

	return (
		<html lang={state.language} class={state.theme}>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{config.branding.appName}</title>
				<link rel="stylesheet" href="../static/styles.css" />

				{
					/**
					 * Settings that enable PWA support for SecretBin
					 */
				}
				<link crossorigin="use-credentials" rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href={asset("/images/favicon.ico")} />
				<link rel="apple-touch-icon" sizes="180x180" href={asset("/images/apple-touch-icon.png")} />
				<link rel="icon" type="image/png" sizes="32x32" href={asset("/images/favicon-32x32.png")} />
				<link rel="icon" type="image/png" sizes="16x16" href={asset("/images/favicon-16x16.png")} />
				<link rel="manifest" href="/manifest.json" />
				<link
					rel="mask-icon"
					href={asset("/images/safari-pinned-tab.svg")}
					{...{ color: state.theme === Theme.Dark ? "#121826" : "#ffffff" }}
				/>
				<meta name="msapplication-TileColor" content={state.theme === Theme.Dark ? "#121826" : "#ffffff"} />
				<meta name="theme-color" content={state.theme === Theme.Dark ? "#121826" : "#ffffff"} />

				{
					/**
					 * Metadata used for generating a link preview e.g. in Teams. Translations are not possible
					 * here since these tags are not read by an actual web browser
					 */
				}
				<meta name="twitter:card" content="summary" />
				<meta name="twitter:title" content={`Sends secrets using ${config.branding.appName}`} />
				<meta name="twitter:description" content="Visit this link in order to view the secret." />
				<meta name="twitter:image" content={asset("/images/apple-touch-icon.png")} />
				<meta property="og:title" content={config.branding.appName} />
				<meta property="og:site_name" content={config.branding.appName} />
				<meta property="og:description" content="Visit this link in order to view the secret." />
				<meta property="og:image" content={asset("/images/apple-touch-icon.png")} />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:width" content="180" />
			</head>
			<body class="bg-white text-black dark:bg-gray-800 dark:text-white" f-client-nav>
				<Terms state={state} />

				<nav class="fixed start-0 top-0 z-20 w-full bg-gray-50 shadow dark:bg-gray-900">
					<div class="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
						<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
							<Show if={config.branding.showLogo}>
								<img
									class={clsx("h-8", { "dark:invert": config.branding.invertLogo })}
									src={asset("/images/Icon.png")}
								/>
							</Show>
							<span class="self-center whitespace-nowrap font-semibold text-2xl dark:text-white">
								{config.branding.appName}
							</span>
						</a>
						<div class="flex items-center space-x-1 md:order-2 md:space-x-0 rtl:space-x-reverse">
							<NavMenu state={state} />
						</div>
					</div>
				</nav>

				<div class="pt-20 pb-20 sm:pt-10 sm:pb-10">
					<div class="content">
						<div class="mx-auto px-4 py-8">
							{/* Show banner e.g. for planned maintenance message if configured */}
							<Show if={config.banner.enabled}>
								<div class="mx-auto">
									<div class="mx-auto flex max-w-screen-md flex-col items-center justify-center">
										<div class="w-full p-4">
											<Message
												type={config.banner.type}
												title={config.branding.appName}
												message={config.banner.text[state.language] ?? config.banner.text.en}
											/>
										</div>
									</div>
								</div>
							</Show>

							<Partial name="content">
								<Component />
							</Partial>
						</div>
					</div>
				</div>

				{/* Add footer with configured links */}
				<footer class="fixed bottom-0 left-0 z-20 w-full border-gray-200 border-t bg-white p-4 shadow md:flex md:items-center md:justify-between md:p-6 dark:border-gray-600 dark:bg-gray-800">
					<span class="text-gray-500 text-sm sm:text-center dark:text-gray-400">
						{config.branding.footer}
					</span>
					<ul class="mt-3 flex flex-wrap items-center font-medium text-gray-500 text-sm sm:mt-0 dark:text-gray-400">
						{config.branding.links.map((link) => (
							<li>
								<a
									class="me-4 hover:underline md:me-6"
									target="_blank"
									href={link.link[state.language] ?? link.link.en}
								>
									{link.name[state.language] ?? link.name.en}
								</a>
							</li>
						))}
						<li>
							<a class="me-4 hover:underline md:me-6" href="/credits">
								{$("Credits.Title")}
							</a>
						</li>
					</ul>
				</footer>
			</body>
		</html>
	)
})
