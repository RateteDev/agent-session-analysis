import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { parseArgs } from "node:util"
import index from "./web/index.html"

const { values } = parseArgs({
  options: {
    host: { type: "string" },
    port: { type: "string" },
    dev: { type: "boolean" },
  },
})
if (values.host === undefined || values.port === undefined)
  throw new Error("Both --host and --port are required")

const samplesDir = join(import.meta.dir, "..", "samples")

async function sampleNames() {
  const names = await readdir(samplesDir)
  return names.filter((name) => name.endsWith(".jsonl")).sort()
}

Bun.serve({
  hostname: values.host,
  port: Number(values.port),
  // falseでは起動時に束ねた結果を返し続けるため、編集を反映するには--devを付ける
  development: values.dev === true,
  routes: {
    "/": index,
    "/samples/:name": async (request) => {
      const name = request.params.name
      if (!(await sampleNames()).includes(name))
        return new Response("Not found", { status: 404 })
      return new Response(Bun.file(join(samplesDir, name)), {
        headers: { "content-type": "application/x-ndjson; charset=utf-8" },
      })
    },
  },
})

console.log(
  `agent-session-analysis viewer: http://${values.host}:${values.port}`,
)
