import type { ArchiveBlock, ArchiveEvent } from "../../types"
import { el } from "../dom"
import { formatTimestamp, formatTokens } from "../format"
import { createEventBody } from "./event-body"

const PREVIEW_LENGTH = 200

export function createEventRow(event: ArchiveEvent): HTMLDetailsElement {
  const { block } = event
  const details = el("details", "event-details")

  const summary = el("summary", "event-summary")
  summary.append(el("span", "event-seq", `#${event.seq}`))
  const kind = el("span", "badge", kindLabel(block))
  kind.dataset.variant = "secondary"
  summary.append(kind)
  if (block.tool !== null) {
    const tool = el("span", "badge event-tool", block.tool)
    tool.dataset.variant = "outline"
    summary.append(tool)
  }
  summary.append(el("span", "event-preview", preview(block)))
  if (event.tokens !== null) {
    const tokens = el(
      "span",
      "event-tokens",
      `${formatTokens(event.tokens.value)} tok`,
    )
    tokens.title = event.tokens.method
    summary.append(tokens)
  }

  const panel = el("div", "event-panel")
  const foot = createFoot(event)
  panel.append(createEventBody(block), ...(foot === null ? [] : [foot]))
  details.append(summary, panel)
  return details
}

function kindLabel(block: ArchiveBlock): string {
  if (block.type !== "text") return block.type
  return block.role ?? "未記録"
}

function preview(block: ArchiveBlock): string {
  if (block.file !== null) return block.file.name ?? block.file.media_type
  if (block.content === null) return ""
  const line = block.content.split("\n", 1)[0] ?? ""
  return line.slice(0, PREVIEW_LENGTH)
}

function createFoot(event: ArchiveEvent): HTMLElement | null {
  const parts = [
    ...(event.ts === null ? [] : [formatTimestamp(event.ts)]),
    ...(event.model === null ? [] : [event.model]),
  ]
  return parts.length === 0 ? null : el("p", "event-foot", parts.join(" · "))
}
