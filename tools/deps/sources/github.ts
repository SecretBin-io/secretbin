import { Octokit } from "octokit"

const octokit = new Octokit({
	auth: Deno.env.get("DENO_DEPS_GITHUB_TOKEN") ?? Deno.env.get("GITHUB_TOKEN"),
})

export interface GitHubInfo {
	author?: string
	license?: string
	licenseFile?: string
}

/**
 * Get author and license information from GitHub
 * @param owner Repository owner
 * @param repo Repository name
 */
export async function getGitHubInfo(owner: string, repo: string): Promise<GitHubInfo> {
	const author = await octokit.rest.users
		.getByUsername({ username: owner })
		.then((x) => x.data.name ?? undefined)
		.catch(() => undefined)

	const license = await octokit.rest.repos
		.get({ repo, owner })
		.then((x) => x.data.license?.name ?? undefined)
		.catch(() => undefined)

	const files = await octokit.rest.repos
		.getContent({ repo, owner, path: "" })
		.then((x) => Array.isArray(x.data) ? x.data : [])
		.catch(() => [])

	const licenseFile = files
		.find((x) =>
			x.download_url && ["LICENSE", "LICENSE.MD", "LICENSE-MIT"]
				.includes(x.name.toUpperCase())
		)?.download_url ?? undefined

	return { author, license, licenseFile }
}
