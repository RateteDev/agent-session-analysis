import type { ArchiveBlock } from "../../types"
import { el } from "../dom"

export function createEventBody(block: ArchiveBlock): HTMLElement {
  if (block.content === null)
    return el("p", "event-empty", "内容は記録されていません")

  if (block.type === "image" || block.type === "file") {
    const file = block.file
    if (block.type === "image" && block.content.startsWith("data:image/")) {
      const image = el("img", "event-image")
      image.src = block.content
      image.alt = file?.name ?? "アーカイブに含まれる画像"
      return image
    }
    if (block.content.startsWith("data:")) {
      const link = el(
        "a",
        "event-download",
        `${file?.name ?? "ファイル"} をダウンロード`,
      )
      link.href = block.content
      link.download = file?.name ?? "file"
      return link
    }
    return el("pre", "event-code", block.content)
  }
  if (block.type === "tool_use" || block.type === "tool_result")
    return el("pre", "event-code", prettify(block.content))
  return el("div", "event-text", block.content)
}

function prettify(content: string): string {
  try {
    const parsed: unknown = JSON.parse(content)
    return typeof parsed === "object" && parsed !== null
      ? JSON.stringify(parsed, null, 2)
      : content
  } catch {
    return content
  }
}
