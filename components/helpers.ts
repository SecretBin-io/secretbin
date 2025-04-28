import { JSX } from "preact"

export interface BaseProps {
	class?: string
	style?: JSX.CSSProperties
}

/**
 * Generates a random ID
 * @param prefix Optional prefix for the ID
 * @returns ID
 */
export const randomID = (prefix?: string) => `${prefix ? prefix + "-" : ""}${Math.floor(Math.random() * 100)}`

/**
 * Returns the provided ID or Generates a random ID for a given element type
 * @param type Element type e.g. img, div, etc.
 * @param id Custom ID
 * @returns ID
 */
export const elementID = (type: string, id?: string) => id ? id : randomID(type)

/**
 * Converts a HTML image into a PNG image data URL
 * @param img Image to convert
 * @returns Image data URL
 */
export const imageDataURL = (img: HTMLImageElement) => {
	const canvas = globalThis.document.createElement("canvas")
	canvas.width = img.width
	canvas.height = img.width
	canvas.getContext("2d")?.drawImage(img, 0, 0, img.width, img.width)

	return canvas.toDataURL(`image/png`, 1.0)
}

/**
 * Downloads a given data URL as a file in the browser
 * @param url Data URL to download
 * @param filename Filename to use for the download
 */
export const downloadDataURL = (url: string, filename: string) => {
	const link = globalThis.document.createElement("a")
	link.href = url
	link.download = filename
	link.click()
}
