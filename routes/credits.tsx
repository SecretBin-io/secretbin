import { PageContent, Table } from "components"
import { define } from "utils"
import { useTranslation } from "utils/hooks"
import credits from "../credits.json" with { type: "json" }

/**
 * Page for show copyright and credit information
 */
export default define.page(({ state }) => {
	const $ = useTranslation(state.language)

	return (
		<PageContent title={$("Credits.Title")}>
			<p
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: (state.config.branding.footer !== "Nihility.io"
						? $("Credits.BrandedNotice", { name: state.config.branding.appName }) + " "
						: "") +
						$("Credits.SourceNotice"),
				}}
			/>
			<br />
			<p
				// deno-lint-ignore react-no-danger
				dangerouslySetInnerHTML={{
					__html: $("Credits.Description", { name: state.config.branding.appName }),
				}}
			/>

			<br />

			<div class="relative overflow-x-auto">
				<h5 class="mb-2 font-bold text-gray-900 text-xl dark:text-white">
					{$("Credits.Components.Title")}
				</h5>
				<p
					// deno-lint-ignore react-no-danger
					dangerouslySetInnerHTML={{
						__html: $("Credits.Components.Description", { name: state.config.branding.appName }),
					}}
				/>
				<br />
				<Table
					headers={{
						component: $("Credits.Components.Headers.Component"),
						author: $("Credits.Components.Headers.Author"),
						license: $("Credits.Components.Headers.License"),
					}}
					rows={credits.map((d) => ({
						component: d.repository ? <a href={d.repository} target="_blank">{d.name}</a> : <>{d.name}</>,
						author: (d.author ?? "").split(", ").map((x, i) => i === 0 ? x : <>,<br />{x}</>),
						license: d.licenseFile
							? <a href={d.licenseFile} target="_blank">{d.license}</a>
							: <>{d.license}</>,
					}))}
				/>
			</div>
		</PageContent>
	)
})
