import { PageContent, Table } from "components"
import { config } from "config"
import { type PageProps } from "fresh"
import { useTranslation } from "lang"
import { JSX } from "preact"
import { State } from "state"
import credits from "../credits.json" with { type: "json" }

/**
 * Removes a given prefix from a string if the string has it
 * @param s String
 * @param prefix Prefix to remove
 * @returns String without the prefix
 */
export const trimPrefix = (s: string, prefix: string): string => s.startsWith(prefix) ? s.slice(prefix.length) : s

/**
 * Page for show copyright and credit information
 */
export default function Credits({ state }: PageProps<unknown, State>): JSX.Element {
	const $ = useTranslation(state.language)

	return (
		<PageContent title={$("Credits.Title")}>
			<p
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: (config.branding.footer !== "Nihility.io"
						? $("Credits.BrandedNotice", { name: config.branding.appName }) + " "
						: "") +
						$("Credits.SourceNotice"),
				}}
			/>
			<p
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: $("Credits.Description", { name: config.branding.appName }),
				}}
			/>

			<br />

			<div class="relative overflow-x-auto">
				<h5 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
					{$("Credits.Components.Title")}
				</h5>
				<div
					// deno-lint-ignore react-no-danger
					dangerouslySetInnerHTML={{
						__html: $("Credits.Components.Description", { name: config.branding.appName }),
					}}
				/>
				<br />
				<Table
					headers={{
						component: $("Credits.Components.Headers.Component"),
						version: $("Credits.Components.Headers.Version"),
						license: $("Credits.Components.Headers.License"),
						author: $("Credits.Components.Headers.Author"),
					}}
					rows={credits.map((d) => ({
						component: d.repository ? <a href={d.repository} target="_blank">{d.name}</a> : <>{d.name}</>,
						version: d.version,
						license: d.licenseFile
							? <a href={d.licenseFile} target="_blank">{d.license}</a>
							: <>{d.license}</>,
						author: d.authors?.join(", ") ?? "",
					}))}
				/>
			</div>
		</PageContent>
	)
}
