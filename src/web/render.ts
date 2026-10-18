import type { Archive } from "../types"
import { createArchiveHeading } from "./components/archive-heading"
import { createEventList } from "./components/event-list"
import { createMessageList } from "./components/message-list"
import { createRoleFilter } from "./components/role-filter"
import { createViewSwitch } from "./components/view-switch"
import { el } from "./dom"
import { countRoles } from "./role"
import { toMessages } from "./to-messages"

export function renderArchive(archive: Archive, name: string): HTMLElement {
  const root = el("article", "archive")
  const head = el("div", "archive-head")
  head.append(createArchiveHeading(archive.meta, name))

  if ("events" in archive) {
    const detail = createEventList(archive.events)
    const filter = createRoleFilter(
      countRoles(archive.events),
      detail.setHiddenRoles,
    )
    const conversation = createMessageList(toMessages(archive.events))
    conversation.hidden = true
    head.append(
      createViewSwitch((view) => {
        const showDetail = view === "detail"
        filter.hidden = !showDetail
        detail.element.hidden = !showDetail
        conversation.hidden = showDetail
      }),
    )
    root.append(head, filter, detail.element, conversation)
  } else {
    root.append(head, createMessageList(archive.messages))
  }
  return root
}
