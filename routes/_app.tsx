import classNames from "classnames"
import { Message, Show } from "components"
import { config } from "config"
import { type PageProps } from "fresh"
import { asset, Partial } from "fresh/runtime"
import { NavMenu, Terms } from "islands"
import { useTranslation } from "lang"
import { State, Theme } from "state"

/**
 * Wrapper for all pages. Providers header info and navigation
 */
export default ({ Component, state }: PageProps<unknown, State>) => {
	const $ = useTranslation(state.language)

	return (
		<html lang={state.language} class={state.theme}>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{config.branding.appName}</title>
				<link rel="stylesheet" href="/styles.css" />

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
			<body class="bg-white dark:bg-gray-800 text-black dark:text-white" f-client-nav>
				<Terms state={state} />

				<nav class="fixed z-20 w-full top-0 start-0 bg-gray-50 shadow dark:bg-gray-900">
					<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
						<a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
							<Show if={config.branding.showLogo}>
								<img
									class={classNames("h-8", { "dark:invert": config.branding.invertLogo })}
									src={asset("/images/Icon.png")}
								/>
							</Show>
							<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
								{config.branding.appName}
							</span>
						</a>
						<div class="flex items-center md:order-2 space-x-1 md:space-x-0 rtl:space-x-reverse">
							<NavMenu state={state} />
						</div>
					</div>
				</nav>

				<div class="pt-20 pb-20 sm:pt-10 sm:pb-10">
					<div class="content">
						<div class="px-4 py-8 mx-auto">
							{/* Show banner e.g. for planned maintenance message if configured */}
							<Show if={config.banner.enabled}>
								<div class="mx-auto">
									<div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
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
				<footer class="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
					<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
						{config.branding.footer}
					</span>
					<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
						{config.branding.links.map((link) => (
							<li>
								<a
									class="hover:underline me-4 md:me-6"
									target="_blank"
									href={link.link[state.language] ?? link.link.en}
								>
									{link.name[state.language] ?? link.name.en}
								</a>
							</li>
						))}
						<li>
							<a class="hover:underline me-4 md:me-6" href="/credits">
								{$("Credits.Title")}
							</a>
						</li>
					</ul>
				</footer>
			</body>
		</html>
	)
}
