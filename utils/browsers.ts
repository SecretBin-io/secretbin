// Define the minimum supported browser versions
const browserVersions = {
	Chrome: 130,
	Edge: 130,
	Firefox: 132,
	Safari: 18,
}

// Create regex patterns for each supported browser to extract name and version
const browserRegex = {
	Chrome: /(?<browser>Chrom(?:ium|e))\/(?<version>\d+)/,
	Edge: /(?<browser>Edge?)\/(?<version>\d+)/,
	Firefox: /(?<browser>Firefox)\/(?<version>\d+)/,
	Safari: /(?<version>\d+)(?:[,.\d]+|)(?: \(\w+\)|)(?: Mobile\/\w+|) (?<browser>Safari)\//,
}

// Combine individual regex patterns into one
const rBrowser = new RegExp(Object.values(browserRegex).map((r) => r.source).join("|"))

// Create a human-readable string of supported browsers
export const supportedBrowsersText = Object.entries(browserVersions)
	.map(([browser, version]) => `${browser} ${version}+`)
	.join(", ")

// Create a browserslist target string for build tools
export const browserTarget = Object.entries(browserVersions)
	.map(([browser, version]) => `${browser.toLowerCase()}${version}`)

/**
 * Checks if the given user agent string belongs to a supported browser
 * @param userAgent User agent string to check
 * @returns True if the browser is supported, false otherwise
 */
export function isBrowserSupported(userAgent: string): boolean {
	if (!userAgent) {
		return false
	}

	const ua = userAgent.match(rBrowser)?.groups
	if (!ua?.browser || !ua?.version) {
		return false
	}

	switch (ua.browser.toLowerCase()) {
		case "chrome":
		case "chromium":
			return parseInt(ua.version, 10) >= browserVersions.Chrome
		case "edg":
		case "edge":
			return parseInt(ua.version, 10) >= browserVersions.Edge
		case "firefox":
			return parseInt(ua.version, 10) >= browserVersions.Firefox
		case "safari":
			return parseInt(ua.version, 10) >= browserVersions.Safari
		default:
			return false
	}
}
