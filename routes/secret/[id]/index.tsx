import { PagePropsWithContext } from "context"
import { ViewSecret } from "islands"

/**
 * Renders page for viewing a secret
 */
export default ({ params, state: ctx }: PagePropsWithContext) => <ViewSecret ctx={ctx} id={params.id} />
