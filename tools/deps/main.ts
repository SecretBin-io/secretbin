// deno-lint-ignore-file no-console
import denoConfig from "../../deno.json" with { type: "json" }
import { strings } from "../../utils/helpers/mod.ts"
import { getGitHubInfo } from "./sources/mod.ts"
import { getRegistryPackage } from "./sources/registry.ts"

export interface Dependency {
	registry: string
	name: string
	author?: string
	repository?: string
	license?: string
	licenseFile?: string
}

const rDependency = /^(?<registry>jsr|npm):(?<package>.*)@[\^+=<>~]*(?<version>.*)$/
const rGitHub = /^https:\/\/github.com\/(?<owner>.*)\/(?<repository>.*)$/

// Load excluded dependencies and compile the regular expressions
const excludedDependencies =
	denoConfig.credits.excludeDependencies?.flatMap((x) =>
		typeof x === "string"
			? [new RegExp(x)]
			: Array.isArray(x.pattern)
			? x.pattern.map((x) => new RegExp(x))
			: [new RegExp(x.pattern)]
	) ?? []

// Prefill dependencies with the manually specified ones
const dependencies: Record<string, Dependency> = denoConfig.credits.dependencies
	.reduce((p, c) => ({ ...p, [c.name]: c }), {})

// Initialize the dependencies queue with the direct dependencies
const dependencyQueue = Object.values(denoConfig.imports)
	.flatMap((x) => {
		const m = x.match(rDependency)
		if (!m) {
			return []
		}
		return [`${m.groups!.registry}:${m.groups!.package}`]
	})

// Iterate through the dependencies and fetch more information from the respective registries,
// while discovering nested dependencies
while (true) {
	const item = dependencyQueue.pop()

	// Once the queue is empty, we are done
	if (item === undefined) {
		break
	}
	const [registry, packageName] = item.split(":", 2)

	// Ignore dependencies which have either already been processed or are ignored
	if (dependencies[packageName] || excludedDependencies.some((r) => r.test(packageName))) {
		continue
	}

	console.log(packageName)

	// Fetch dependency information from the registry
	const r = await getRegistryPackage(registry, packageName)

	// Add nested dependencies to the queue
	dependencyQueue.push(...r.dependencies)

	const d: Dependency = {
		registry,
		name: packageName,
		repository: r.repository,
		author: r.author,
		license: r.license ?? "Other",
		licenseFile: r.licenseFile,
	}

	// Fetch licensing information from GitHub if possible
	const m = r.repository?.match(rGitHub)
	if (m) {
		const res = await getGitHubInfo(m.groups!.owner, m.groups!.repository)
		if (res) {
			d.author = res.author ?? d.author
			d.license = res.license ?? d.license
			d.licenseFile = res.licenseFile
		}
	}

	// If the the license name is not specified, infer it from the license text
	if (d.license === "Other" && d.licenseFile) {
		try {
			const res = await fetch(d.licenseFile!).then((r) => r.text())
			if (res.includes("# Blue Oak Model License")) {
				d.license = "Blue Oak Model License"
			}
		} catch {
			console.log(`[ERROR] ${d.name}: Failed to read license file from Github`)
		}
	}

	if (d.license === "MIT") {
		d.license = "MIT License"
	}

	dependencies[packageName] = d
}

Deno.writeTextFileSync(
	"credits.json",
	JSON.stringify(
		Object.values(dependencies).toSorted((a, b) =>
			strings.trimPrefix(a.name.toLowerCase(), "@") < strings.trimPrefix(b.name.toLowerCase(), "@") ? -1 : 1
		),
		null,
		2,
	),
)
