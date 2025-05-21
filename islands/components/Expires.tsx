import { useTranslationWithPrefix } from "lang"
import { useEffect, useState } from "preact/hooks"
import { State } from "state"

export interface ExpiresProps {
	state: State
	date: Date
}

export const Expires = ({ state, date }: ExpiresProps) => {
	const [dateString, setDateString] = useState(date.toLocaleString(state.locale))
	const $ = useTranslationWithPrefix(state.language, "Common")

	useEffect(() => setDateString(date.toLocaleString()), [])

	return (
		<p class="mb-5 text-base text-gray-500 dark:text-gray-400">
			{$("Expires")}: {dateString}
		</p>
	)
}
