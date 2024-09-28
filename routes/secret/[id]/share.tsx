import { Message, PageContent } from "components"
import { ShareSecret } from "islands"
import { useTranslationWithPrefix } from "lang"
import { Secrets } from "secret/server"
import { Expires } from "../../../islands/components/Expires.tsx"
import { type PageProps } from "fresh"
import { State } from "state"

/**
 * Renders page for sharing a secret
 */
export default async ({ params, state }: PageProps<unknown, State>) => {
    const $ = useTranslationWithPrefix(state.lang, "ShareSecret")
    const metadata = await Secrets.shared.getSecretMetadata(params.id)

    if (!metadata.isSuccess()) {
        return (
            <PageContent title={$("Title")}>
                <Message type="error" title="Error" message={metadata.unwrapError().message} />
            </PageContent>
        )
    }

    return (
        <PageContent title={$("Title")} description={$("Description")}>
            <div class="items-left justify-left space-y-4 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
                <div class="mx-auto">
                    <Expires state={state} date={metadata.value.expires} />
                    <ShareSecret state={state} id={params.id} />
                </div>
            </div>
        </PageContent>
    )
}
