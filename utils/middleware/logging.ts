import { logWeb } from "server/log"
import { define } from "utils"

/**
 * Middleware that logs requests
 */
export const loggingMiddleware = define.middleware(async (ctx) => {
	const res = await ctx.next()
	const msg = `${ctx.req.method} [${res.status}] ${ctx.req.url}`
	const args = {
		method: ctx.req.method,
		url: ctx.req.url,
		status: res.status,
	}

	if (res.status >= 200 && res.status <= 299) {
		logWeb.info(msg, args)
	} else if (res.status >= 500 && res.status <= 599) {
		logWeb.error(msg, args)
	} else {
		logWeb.warn(msg, args)
	}
	return res
})
