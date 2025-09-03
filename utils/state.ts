import { Config } from "config"
import { Language } from "lang"

export enum Theme {
	Light = "light",
	Dark = "dark",
}

export interface StateConfig extends Omit<Config, "storage"> {
	/** Configs regarding how secrets are stored */
	storage: Omit<Storage, "database">
}

export interface State {
	theme: Theme
	locale: string
	language: Language
	cookies: Record<string, string>
	config: StateConfig
}
