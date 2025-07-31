// deno-lint-ignore no-external-import
import $ from "jsr:@david/dax"

await $`rm -rf temp postgres`
await $`git clone https://github.com/porsager/postgres.git temp`

await $`mkdir -p postgres/types`
await $`mkdir -p postgres/src`

await transpile("temp/deno/mod.js", "postgres/mod.js")
await transpile("temp/types/index.d.ts", "postgres/types/index.d.ts")

for await (const entry of Deno.readDir("temp/src")) {
	await transpile("temp/src/" + entry.name, "postgres/src/" + entry.name)
}

async function transpile(src: string, dst: string): Promise<void> {
	const code = await Deno.readTextFile(src)

	const segments = [`// deno-lint-ignore-file`]

	if (code.includes("Buffer")) {
		segments.push(`import { Buffer } from 'node:buffer'`)
	}

	if (code.includes("setImmediate")) {
		segments.push(`import { setImmediate, clearImmediate } from 'node:timers'`)
	}

	if (!src.includes("types.d.ts") && code.includes("process.")) {
		segments.push(`import process from 'node:process'`)
	}

	segments.push(
		code
			.replaceAll("import net from 'net'", "import { net } from '../../polyfills.js'")
			.replaceAll("import tls from 'tls'", "import { tls } from '../../polyfills.js'")
			.replaceAll(/ from '([a-z_]+)'/g, " from 'node:$1'")
			.replaceAll(`export = postgres;`, `export default postgres;`),
	)

	await Deno.writeTextFile(dst, segments.join("\n"))
}

await $`rm -rf temp`
