import type { ArchiveEvent, ArchiveMessage } from "../types"

// fullのeventから、messagesと同じ見た目で読めるようにuserとassistantの本文だけを取り出す
export function toMessages(events: readonly ArchiveEvent[]): ArchiveMessage[] {
  const messages: ArchiveMessage[] = []
  for (const { ts, block } of events) {
    if (block.type !== "text" || block.content === null) continue
    if (block.role !== "user" && block.role !== "assistant") continue
    messages.push({
      record: "message",
      seq: messages.length + 1,
      ts,
      role: block.role,
      content: block.content,
    })
  }
  return messages
}
