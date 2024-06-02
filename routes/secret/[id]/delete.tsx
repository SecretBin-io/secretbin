import { PagePropsWithContext } from "context"
import { DeleteSecret } from "islands"

/**
 * Renders page for deleting a secrets
 */
export default ({ params, state: ctx }: PagePropsWithContext) => <DeleteSecret ctx={ctx} id={params.id} />
