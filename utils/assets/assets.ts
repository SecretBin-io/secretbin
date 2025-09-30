import * as fs from "@std/fs"
import { asset as freshAsset } from "fresh/runtime"
import { Asset } from "./asset.ts"

const assetCache = await (async function loadCache(): Promise<Record<string, Asset>> {
	try {
		const assetCache: Record<string, Asset> = {}

		const walker = fs.walk("./public", {
			includeFiles: true,
			includeDirs: false,
			includeSymlinks: false,
		})

		for await (const f of walker) {
			const a = await Asset.load(f.path)
			if (a) {
				assetCache["/" + f.path.substring("public/".length).toLowerCase()] = a
			}
		}

		return assetCache
	} catch {
		return {}
	}
})()

/**
 * Gets the asset object for a given file
 * @param filePath Relative file path to the asset
 * @returns Asset object or undefined if the asset was not found
 */
export function asset(filePath: string): Asset | undefined {
	return assetCache[filePath.toLowerCase()]
}

/**
 * Gets the URL path for a given asset. If the given asset has a file
 * with the same name in ./public/branding return that path instead.
 * This allows the user to override files with a custom branding.
 * @param filePath Relative file path to the asset
 * @returns URL path
 */
export function assetPath(filePath: string): string {
	const brandedPath = "/branding" + filePath.toLowerCase()
	if (assetCache[brandedPath]) {
		return brandedPath
	}

	return freshAsset(filePath)
}
