import { JSX } from "preact"

export interface BaseProps {
	class?: string
	style?: JSX.CSSProperties
}

export const randomID = (prefix?: string) => `${prefix ? prefix + "-" : ""}${Math.floor(Math.random() * 100)}`
export const elementID = (type: string, id?: string) => id ? id : randomID(type)
