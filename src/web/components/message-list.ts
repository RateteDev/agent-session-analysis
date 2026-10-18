import type { ArchiveMessage } from "../../types"
import { el } from "../dom"
import { formatTimestamp } from "../format"

export function createMessageList(
  messages: readonly ArchiveMessage[],
): HTMLElement {
  const list = el("ol", "message-list")
  for (const message of messages) {
    const item = el("li", "message")
    item.dataset.role = message.role
    if (message.ts !== null) item.title = formatTimestamp(message.ts)
    item.append(
      el("span", "message-role", message.role),
      el("div", "message-body", message.content),
    )
    list.append(item)
  }
  return list
}
