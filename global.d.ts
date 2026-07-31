declare global {
	interface DataTransferItem {
		/**
		 * Possible future name of [webkitGetAsEntry](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry).
		 */
		getAsEntry?(): FileSystemEntry | null
	}
}

export {}
