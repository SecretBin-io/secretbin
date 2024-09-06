import { PageContent, Table } from "components"
import { config } from "config"
import { PagePropsWithContext } from "context"
import deps from "../deps.json" with { type: "json" }
import { useTranslation } from "lang"

/**
 * Page for show copyright and credit information
 */
export default ({ state: ctx }: PagePropsWithContext) => {
	const $ = useTranslation(ctx.lang)
	return (
		<PageContent title={$("Credits.Title")}>
			<p
				dangerouslySetInnerHTML={{
					__html: (config.branding.footer !== "Nihility.io"
						? $("Credits.BrandedNotice", { name: config.branding.appName })
						: "") +
						$("Credits.SourceNotice"),
				}}
			/>
			<p
				dangerouslySetInnerHTML={{
					__html: $("Credits.Description", { name: config.branding.appName }),
				}}
			/>

			<br />

			{
				/** Not used at the moment since we don't have any translations at the moment that where done by others */
				/* <div class="relative overflow-x-auto mb-5">
				<h5 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
					{$("Credits.Translations.Title")}
				</h5>
				<div
					dangerouslySetInnerHTML={{
						__html: $("Credits.Translations.Description", { name: config.branding.appName }),
					}}
				/>
				<br />
				<Table
					headers={{
						language: $("Credits.Translations.Headers.Translation"),
						author: $("Credits.Translations.Headers.Author"),
					}}
					rows={supportedLanguages.map((lang) => ({
						language: `${lang.label} (${lang.native})`,
						author: lang.author,
					}))}
				/>
			</div> */
			}

			<div class="relative overflow-x-auto">
				<h5 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">
					{$("Credits.Components.Title")}
				</h5>
				<div
					dangerouslySetInnerHTML={{
						__html: $("Credits.Components.Description", { name: config.branding.appName }),
					}}
				/>
				<br />
				<Table
					headers={{
						components: $("Credits.Components.Headers.Component"),
						version: $("Credits.Components.Headers.Version"),
						license: $("Credits.Components.Headers.License"),
						author: $("Credits.Components.Headers.Author"),
					}}
					rows={deps.map((dependency) => ({
						components: dependency.repository
							? <a href={dependency.repository} target="_blank">{dependency.name}</a>
							: <>{dependency.name}</>,
						version: dependency.version,
						license: dependency.licenseFile
							? <a href={dependency.licenseFile} target="_blank">{dependency.license}</a>
							: <>{dependency.license}</>,
						author: dependency.authors?.join(", ") ?? "",
					}))}
				/>
			</div>
		</PageContent>
	)
}
