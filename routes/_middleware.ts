import { FreshContext } from "$fresh/server.ts"
import { addContext, Context } from "context"

export const handler = async (req: Request, ctx: FreshContext<Context>) => {
	// Add context to each loaded page
	await addContext(req, ctx)
	const resp = await ctx.next()
	return resp
}
