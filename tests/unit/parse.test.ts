import { describe, expect, test } from "bun:test"
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { parseArchive } from "../../src/parse"

const samplesDir = join(import.meta.dir, "..", "..", "samples")

describe("parseArchive", () => {
  test("リポジトリ内のサンプルJSONLをすべて読み込める", async () => {
    const names = (await readdir(samplesDir)).filter((name) =>
      name.endsWith(".jsonl"),
    )
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) {
      const text = await Bun.file(join(samplesDir, name)).text()
      expect(() => parseArchive(text), name).not.toThrow()
    }
  })
})
