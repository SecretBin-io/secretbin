import { define } from "utils"
import { Theme } from "utils/state"
/**
 * Wrapper for all pages. Providers header info and navigation
 */
export default define.page(({ state, Component }) => {
	return (
		<html lang={state.language} data-theme={state.theme}>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{state.config.branding.appName}</title>

				{
					/**
					 * Settings that enable PWA support for SecretBin
					 */
				}
				<link crossorigin="use-credentials" rel="manifest" href="/manifest.json" />
				<link rel="shortcut icon" href="/images/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
				<link rel="manifest" href="/manifest.json" />
				<link
					rel="mask-icon"
					href="/images/safari-pinned-tab.svg"
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
				<meta name="twitter:title" content={`Send secrets using ${state.config.branding.appName}`} />
				<meta name="twitter:description" content="Visit this link in order to view the secret." />
				<meta name="twitter:image" content="/images/apple-touch-icon.png" />
				<meta property="og:title" content={state.config.branding.appName} />
				<meta property="og:site_name" content={state.config.branding.appName} />
				<meta property="og:description" content="Visit this link in order to view the secret." />
				<meta property="og:image" content="/images/apple-touch-icon.png" />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:width" content="180" />
			</head>
			<body class="bg-base-100">
				<Component />
			</body>
		</html>
	)
})
