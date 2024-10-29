import { Language } from "lang"

export enum Theme {
	Light = "light",
	Dark = "dark",
}

export interface State {
	lang: Language
	theme: Theme
	locale: string
	locales: string[]
	termsAccepted: boolean
}
