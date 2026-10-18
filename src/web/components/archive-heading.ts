import type { ArchiveMeta } from "../../types"
import { el } from "../dom"

export function createArchiveHeading(
  meta: ArchiveMeta,
  name: string,
): HTMLElement {
  const list = el("dl", "archive-meta")
  const rows: [string, string | null][] = [
    ["ファイル", name],
    ["harness", meta.harness],
    ["source", meta.source],
    ["extracted_at", meta.extracted_at],
  ]
  for (const [label, value] of rows) {
    if (value === null) continue
    list.append(el("dt", undefined, label), el("dd", undefined, value))
  }
  const heading = el("div", "archive-heading")
  heading.append(el("h2", "archive-title", meta.title ?? name), list)
  return heading
}
