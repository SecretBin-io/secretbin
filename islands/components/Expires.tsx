import { JSX } from "preact"
import { useEffect, useState } from "preact/hooks"
import { useTranslation } from "utils/hooks"
import { State } from "utils/state"

export interface ExpiresProps {
	state: State

	/**
	 * Expiration data
	 */
	date: Date
}

/**
 * Renders the expiration using the user's preferred date format
 */
export function Expires({ state, date }: ExpiresProps): JSX.Element {
	const [dateString, setDateString] = useState(date.toLocaleString(state.locale))
	const $ = useTranslation(state.language, "Common")

	useEffect(() => setDateString(date.toLocaleString()), [])

	return (
		<p class="mb-5 text-base text-gray-500 dark:text-gray-400">
			{$("Expires")}: {dateString}
		</p>
	)
}
