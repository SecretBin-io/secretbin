// deno-lint-ignore no-external-import
import $ from "jsr:@david/dax"

await $`rm -rf temp postgres`
await $`git clone https://github.com/porsager/postgres.git temp`

await $`mkdir -p postgres/types`
await $`mkdir -p postgres/src`

await transpile("temp/deno/polyfills.js", "postgres/polyfills.js")
await transpile("temp/deno/mod.js", "postgres/mod.js")
await transpile("temp/types/index.d.ts", "postgres/types/index.d.ts")

for await (const entry of Deno.readDir("temp/src")) {
	await transpile("temp/src/" + entry.name, "postgres/src/" + entry.name)
}

async function transpile(src: string, dst: string): Promise<void> {
	const code = await Deno.readTextFile(src)

	const segments = [`// deno-lint-ignore-file`]

	if (!src.includes("polyfills.js") && code.includes("Buffer")) {
		segments.push(`import { Buffer } from 'node:buffer'`)
	}

	if (!src.includes("polyfills.js") && code.includes("setImmediate")) {
		segments.push(`import { setImmediate, clearImmediate } from '../polyfills.js'`)
	}

	if (!src.includes("types.d.ts") && code.includes("process.")) {
		segments.push(`import process from 'node:process'`)
	}

	segments.push(
		code
			.replace(
				`function hmac(key, x) {
  return crypto.createHmac('sha256', key).update(x).digest()
}`,
				`const UTF8 = new TextEncoder();

const hmac = async (key, x) => {
  if (typeof key === "string") {
    key = UTF8.encode(key);
  }
  
  if (typeof x === "string") {
    x = UTF8.encode(x);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return Buffer.from(await crypto.subtle.sign("HMAC", cryptoKey, x));
}`,
			)
			.replaceAll(
				"query.writable.push({ chunk, callback })",
				"(query.writable.push({ chunk }), callback())",
			)
			.replaceAll("socket.setKeepAlive(true, 1000 * keep_alive)", "socket.setKeepAlive(true)")
			.replaceAll("import net from 'net'", "import { net } from '../polyfills.js'")
			.replaceAll("import tls from 'tls'", "import { tls } from '../polyfills.js'")
			.replaceAll("import { performance } from 'perf_hooks'", "")
			.replaceAll(/ from '([a-z_]+)'/g, " from 'node:$1'")
			.replaceAll(/ from 'https:\/\/deno.land\/std@[^/]+\/node\/([a-zA-Z]+).ts'/g, " from 'node:$1'")
			.replaceAll(`export = postgres;`, `export default postgres;`),
	)

	await Deno.writeTextFile(dst, segments.join("\n"))
}

await $`rm -rf temp`
