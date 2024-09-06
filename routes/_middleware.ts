import { FreshContext } from "fresh"
import { addContext, Context } from "context"

export const handler = async (ctx: FreshContext<Context>) => {
	// Add context to each loaded page
	await addContext(ctx.req, ctx)
	const resp = await ctx.next()
	return resp
}
