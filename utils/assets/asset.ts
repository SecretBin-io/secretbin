import * as mediaTypes from "@std/media-types"
import * as path from "@std/path"

export class Asset {
	static readonly #cacheLimit = 4 * 1000 * 1000 // Only cache files in memory that are smaller then 4 MB
	#content?: Blob

	/**
	 * Use [Asset.load] to create a new asset object
	 * @param filePath Relative file path of the asset
	 * @param size  File size of the asset
	 * @param contentType  Content type of the asset
	 */
	private constructor(
		public readonly filePath: string,
		public readonly size: number,
		public readonly contentType: string,
	) {}

	/**
	 * Load an asset from the file system
	 * @param filePath Relative file path of the asset
	 * @returns Asset object or undefined if the asset could not be loaded
	 */
	static async load(filePath: string): Promise<Asset | undefined> {
		try {
			const { size } = await Deno.stat(filePath)
			const contentType = mediaTypes.contentType(path.extname(filePath)) ?? "application/octet-stream"
			return new Asset(filePath, size, contentType)
		} catch {
			return undefined
		}
	}

	/**
	 * Load the file content using an async stream. Files smaller than [Asset.#cacheLimit]
	 * will be cached in memory for quicker access.
	 * @returns File content as stream
	 */
	async #asyncStream(): Promise<ReadableStream<Uint8Array<ArrayBuffer>>> {
		if (this.#content) {
			return this.#content.stream()
		} else if (this.size < Asset.#cacheLimit) {
			this.#content = new Blob([await Deno.readFile(this.filePath)])
			return this.#content.stream()
		} else {
			return await Deno.open(this.filePath).then((f) => f.readable)
		}
	}

	/**
	 * Load the file content using a stream. Files smaller than [Asset.#cacheLimit]
	 * will be cached in memory for quicker access.
	 * @returns File content as stream
	 */
	get content(): ReadableStream<Uint8Array<ArrayBuffer>> {
		return ReadableStream.from(
			async function* (
				s: Promise<ReadableStream<Uint8Array<ArrayBuffer>>>,
			): AsyncGenerator<Uint8Array<ArrayBuffer>> {
				for await (const chunk of await s) {
					yield chunk
				}
			}(this.#asyncStream()),
		)
	}
}
