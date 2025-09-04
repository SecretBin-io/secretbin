import { Language } from "lang"
import { Config } from "server/config"

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
