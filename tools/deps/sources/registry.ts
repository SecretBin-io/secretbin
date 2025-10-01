import * as npm from "@nodesecure/npm-registry-sdk"
import { z } from "@zod/zod"
import * as strings from "../../../utils/helpers/strings.ts"

export interface PackageInfo {
	registry: string
	author?: string
	package: string
	repository?: string
	license?: string
	licenseFile?: string
	dependencies: string[]
}

const jsrScheme = z.object({
	scope: z.string().optional(),
	name: z.string().optional(),
	githubRepository: z.object({ owner: z.string(), name: z.string() }).nullable(),
})

/**
 * Convert a JSR package reference into its NPM compatible format.
 * Example: @std/fs => @jsr/std__fs
 * @param ref JSR reference
 */
function jsrToNpmRef(ref: string): string {
	const [scope, pkg] = ref.split("/")
	return `@jsr/${scope.substring(1)}__${pkg}`
}

/**
 * Convert a NPM compatible package reference into its JSR format.
 * Example: @jsr/std__fs => @std/fs
 * @param ref NPM reference
 */
function jsrFromNpmRef(ref: string): string {
	return "@" + ref
		.substring("@jsr/".length)
		.replaceAll("__", "/")
}

/**
 * Fetch package information from NPM
 * @param pkgName Package name
 * @param isJsr Use the NPM-compatible API of JSR instead
 */
async function getNpmPackage(pkgName: string, isJsr?: boolean): Promise<Partial<PackageInfo>> {
	const originalRepo = npm.getNpmRegistryURL()

	if (isJsr) {
		npm.setLocalRegistryURL("https://npm.jsr.io")
	}

	const r = await npm.packument(pkgName).catch(() => undefined)
	if (!r) {
		return {}
	}

	npm.setLocalRegistryURL(originalRepo)

	const { dependencies, ...info } = r.versions[r["dist-tags"].latest]

	let repo = info.repository?.url ?? r.repository?.url
	if (repo) {
		repo = strings.trimPrefix(repo, "git+")
		repo = strings.replacePrefix(repo, "ssh://git@", "https://")
		repo = strings.replacePrefix(repo, "git://", "https://")
		repo = strings.trimSuffix(repo, ".git")
	}

	return {
		author: info.author?.name ?? r.author?.name,
		license: typeof info.license === "string" ? info.license : info.license?.type ?? undefined,
		repository: repo,
		dependencies: Object.keys(dependencies ?? {}),
	}
}

/**
 * Fetch package information from JSR
 * @param pkgName Package name
 */
async function getJsrPackage(pkgName: string): Promise<Partial<PackageInfo>> {
	const [scope, pkg] = pkgName.split("/")
	const r = await fetch(`https://api.jsr.io/scopes/${scope.substring(1)}/packages/${pkg}`)
		.then((x) => x.json())
		.then(jsrScheme.parse)
		.catch(() => ({} as z.infer<typeof jsrScheme>))

	return {
		author: r?.scope,
		repository: r?.githubRepository
			? `https://github.com/${r.githubRepository.owner}/${r.githubRepository.name}`
			: undefined,
	}
}

/**
 * Fetch package information
 * @param registry Registry where the package is hosted
 * @param pkgName Package name
 */
export async function getRegistryPackage(registry: string, pkgName: string): Promise<PackageInfo> {
	const pkgInfo: PackageInfo = {
		registry,
		package: pkgName,
		dependencies: [],
	}

	const npmRes = await getNpmPackage(registry === "npm" ? pkgName : jsrToNpmRef(pkgName), registry === "jsr")
	if (npmRes) {
		pkgInfo.author = npmRes.author
		pkgInfo.repository = npmRes.repository
		pkgInfo.license = npmRes.license
		pkgInfo.licenseFile = npmRes.licenseFile
		pkgInfo.dependencies = npmRes.dependencies ?? []
	}

	if (registry === "jsr") {
		const r = await getJsrPackage(pkgName)
		pkgInfo.author = r?.author ?? pkgInfo.author
		pkgInfo.repository = r?.repository ?? pkgInfo.repository
	}

	pkgInfo.dependencies = pkgInfo.dependencies
		.map((packageName) =>
			packageName.startsWith("@jsr/") ? "jsr:" + jsrFromNpmRef(packageName) : "npm:" + packageName
		)

	return pkgInfo
}
