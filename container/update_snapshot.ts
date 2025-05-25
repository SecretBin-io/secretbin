/**
 * This script is used for creating a branded Docker image with custom static files
 */

import * as fs from "@std/fs"
import { encodeHex } from "@std/encoding/hex"

/**
 * Generate the SHA256 hash of the given file
 * @param fn Filename
 * @returns Hexadecimal encoded file hash
 */
async function hashFile(fn: string): Promise<string> {
	const message = await Deno.readFile(fn)
	const hashBuffer = await crypto.subtle.digest("SHA-256", message)
	return encodeHex(hashBuffer)
}

// Load the current snapshot configuration
const snapshot = await Deno.readTextFile("_fresh/snapshot.json").then(JSON.parse)

// Loop through all static files and add them to the snapshot config
for await (const file of fs.walk("static", { includeDirs: false })) {
	// Get the relative path of the static file
	const staticPath = file.path.slice("static".length)

	// Skip generated files
	if (file.name === ".DS_Store" || snapshot.staticFiles[staticPath].generated === true) {
		continue
	}

	// Add the static file to the snapshot config
	snapshot.staticFiles[staticPath] = {
		hash: await hashFile(file.path),
		generated: false,
	}
}

// Write the updated snapshot configuration
await Deno.writeTextFile("_fresh/snapshot2.json", JSON.stringify(snapshot, null, 2))
