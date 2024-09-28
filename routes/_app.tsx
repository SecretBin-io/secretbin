import { asset, Partial } from "fresh/runtime"
import { Message, Show } from "components"
import { config } from "config"
import { Navbar, Terms } from "islands"
import { useTranslation } from "lang"
import { type PageProps } from "fresh"
import { State, Theme } from "state"

/**
 * Wrapper for all pages. Providers header info and navigation
 */
export default ({ Component, state }: PageProps<unknown, State>) => {
	const $ = useTranslation(state.lang)

	return (
		<html lang={state.lang} class={state.theme}>
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

				<Navbar state={state} />


				<div class="pt-20 pb-20 sm:pt-10 sm:pb-10">
					<Partial name="content">

						<div class="px-4 py-8 mx-auto">
							{/* Show banner e.g. for planned maintenance message if configured */}
							<Show if={!!(config.banner[state.lang] ?? config.banner.en)}>
								<div class="mx-auto">
									<div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
										<div class="w-full p-4">
											<Message
												type="info"
												title={config.branding.appName}
												message={config.banner[state.lang] ?? config.banner.en}
											/>
										</div>
									</div>
								</div>
							</Show>
							<Component />
						</div>
					</Partial>
				</div>

				{/* Add footer with configured links */}
				<footer class="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600">
					<span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
						{config.branding.footer}
					</span>
					<ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
						{config.branding.links.map((link) => (
							<li>
								<a class="hover:underline me-4 md:me-6" target="_blank" href={link.link[state.lang] ?? link.link.en}>
									{link.name[state.lang] ?? link.name.en}
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

				{/* <script src="https://unpkg.com/flowbite@1.5.1/dist/flowbite.js"></script> */}
			</body>
		</html>
	)
}
