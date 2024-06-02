import { PagePropsWithContext } from "context"
import { NewSecret } from "islands"

/**
 * Entry page. Used for created new secrets
 */
export default ({ state: ctx }: PagePropsWithContext) => <NewSecret ctx={ctx} />
