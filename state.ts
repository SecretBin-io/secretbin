import { Language } from "lang"

export enum Theme {
	Light = "light",
	Dark = "dark",
}

export interface State {
	theme: Theme
	locale: string
	language: Language
	cookies: Record<string, string>
}
