import { z } from "@zod/zod"
import denoConfig from "./deno.json" with { type: "json" }

const npmScheme = z.object({
	"dist-tags": z.object({ latest: z.string() }),
	versions: z.record(
		z.string(),
		z.object({
			license: z.string().optional(),
			authors: z.array(z.string()).optional(),
			repository: z.object({ url: z.string() }).transform((x) => x.url).or(z.string()).optional(),
			dependencies: z.record(z.string(), z.string()).default({}),
		}),
	),
})

const jsrScheme = z.object({
	scope: z.string(),
	name: z.string(),
	githubRepository: z.object({ owner: z.string(), name: z.string() }).nullable()
		.transform((x) => x ? `https://github.com/${x.owner}/${x.name}` : undefined),
}).transform(({ scope, githubRepository: repository }) => ({ author: scope, repository }))

const rDependency = /^(?<registry>jsr|npm):(?<package>.*)@[\^+=<>~]*(?<version>.*)$/

const parseDependencyKey = (x: string) => {
	if (x.startsWith("@jsr/")) {
		return "jsr:@" + x.substring("@jsr/".length).replaceAll("__", "/")
	}

	return "npm:" + x
}

interface Dependency {
	registry: string
	package: string
	license?: string
	authors?: string[]
	repository?: string
	dependencies: string[]
}

const imports = await Promise.all(
	Object.values(denoConfig.imports)
		.map(async (x): Promise<Dependency | undefined> => {
			const m = x.match(rDependency)
			if (!m) {
				return undefined
			}

			const d: Dependency = {
				registry: m.groups!["registry"],
				package: m.groups!["package"],
				dependencies: [],
			}

			if (m.groups!["registry"] === "npm") {
				const res = await fetch(`https://registry.npmjs.com/${m.groups!["package"]}`)
				const data = await res.json()
				const r = npmScheme.parse(data)
				const { dependencies, ...info } = r.versions[r["dist-tags"].latest]
				d.authors = info.authors
				d.license = info.license
				d.repository = info.repository
				d.dependencies = Object.keys(dependencies).map(parseDependencyKey)
			} else if (m.groups!["registry"] === "jsr") {
				const [scope, pkg] = m.groups!["package"].split("/")
				const res = await fetch(`https://api.jsr.io/scopes/${scope.substring(1)}/packages/${pkg}`)
				const data = await res.json()
				const r = jsrScheme.parse(data)

				const res2 = await fetch(`https://npm.jsr.io/@jsr/${scope.substring(1)}__${pkg}`)
				const data2 = await res2.json()
				const r2 = npmScheme.parse(data2)
				const { dependencies } = r2.versions[r2["dist-tags"].latest]
				d.authors = [r.author]
				d.repository = r.repository
				d.dependencies = Object.keys(dependencies).map(parseDependencyKey)
			}

			return d
		}),
).then((x) => x.filter((x) => x !== undefined))

console.log(imports)
