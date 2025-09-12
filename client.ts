import "./static/styles.css"

// Polyfill for Blob.bytes() in browsers that don't support it yet
// https://developer.mozilla.org/en-US/docs/Web/API/Blob/bytes
if (Blob.prototype.bytes === undefined) {
	Blob.prototype.bytes = function (): Promise<Uint8Array<ArrayBuffer>> {
		return this.arrayBuffer().then((buf) => new Uint8Array(buf))
	}
}
