import { asset, Partial } from "$fresh/runtime.ts"
import { Message, Show } from "components"
import { config } from "config"
import { PagePropsWithContext, Theme } from "context"
import { Footer, Navbar, Terms } from "islands"
import { useLanguage, useTranslation } from "lang"

/**
 * Wrapper for all pages. Providers header info and navigation
 */
export default ({ Component, state: ctx }: PagePropsWithContext) => {
	const [lang] = useLanguage(ctx.lang)
	const $ = useTranslation(ctx.lang)

	return (
		<html lang={ctx.lang} class={ctx.theme}>
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
					{...{ color: ctx.theme === Theme.Dark ? "#121826" : "#ffffff" }}
				/>
				<meta name="msapplication-TileColor" content={ctx.theme === Theme.Dark ? "#121826" : "#ffffff"} />
				<meta name="theme-color" content={ctx.theme === Theme.Dark ? "#121826" : "#ffffff"} />

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
				<Terms ctx={ctx} />
				<Navbar ctx={ctx} />


				<div class="pt-20 pb-20 sm:pt-10 sm:pb-10">
					<Partial name="content">

						<div class="px-4 py-8 mx-auto">
							{/* Show banner e.g. for planned maintenance message if configured */}
							<Show if={!!(config.banner[lang] ?? config.banner.en)}>
								<div class="mx-auto">
									<div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
										<div class="w-full p-4">
											<Message
												type="info"
												title={config.branding.appName}
												message={config.banner[lang] ?? config.banner.en}
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
				<Footer ctx={ctx} />
				{/* <script src="https://unpkg.com/flowbite@1.5.1/dist/flowbite.js"></script> */}
			</body>
		</html>
	)
}
