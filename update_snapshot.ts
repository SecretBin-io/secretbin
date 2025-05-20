/**
 * This script is used for creating a branded Docker image with custom static files
 */

import * as fs from "@std/fs"

// Load the current snapshot configuration
const snapshot = JSON.parse(Deno.readTextFileSync("_fresh/snapshot.json"))

// Loop through all static files and add them to the snapshot config
for (const file of fs.walkSync("static", { includeDirs: false })) {
	if (file.name === ".DS_Store") {
		continue
	}

	// Get the relative path of the static file
	const staticPath = file.path.slice("static".length)

	// Add the static file to the snapshot config
	snapshot.staticFiles[staticPath] = {
		generated: file.name === "styles.css",
	}
}

// Write the updated snapshot configuration
Deno.writeTextFileSync("_fresh/snapshot.json", JSON.stringify(snapshot))
