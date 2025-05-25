import { useTranslationWithPrefix } from "lang"
import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { State } from "state"

export interface ExpiresProps {
	state: State
	date: Date
}

export function Expires({ state, date }: ExpiresProps): JSX.Element {
	const [dateString, setDateString] = useState(date.toLocaleString(state.locale))
	const $ = useTranslationWithPrefix(state.language, "Common")

	useEffect(() => setDateString(date.toLocaleString()), [])

	return (
		<p class="mb-5 text-base text-gray-500 dark:text-gray-400">
			{$("Expires")}: {dateString}
		</p>
	)
}
