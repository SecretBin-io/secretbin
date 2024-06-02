import { PagePropsWithContext } from "context"
import { ShareSecret } from "islands"

/**
 * Renders page for sharing a secret
 */
export default ({ params, state: ctx }: PagePropsWithContext) => <ShareSecret id={params.id} ctx={ctx} />
