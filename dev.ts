#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts"
import config from "./fresh.config.ts"
import { loadSync } from "@std/dotenv"

loadSync({ export: true })

await dev(import.meta.url, "./main.ts", config)
