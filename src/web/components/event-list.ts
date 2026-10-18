import type { ArchiveEvent } from "../../types"
import { el } from "../dom"
import { formatTokens } from "../format"
import { type RoleKey, roleKey } from "../role"
import { createEventRow } from "./event-row"

interface EventGroup {
  readonly turn: number
  readonly events: ArchiveEvent[]
}

interface RowView {
  readonly item: HTMLElement
  readonly role: RoleKey
}

interface GroupView {
  readonly details: HTMLElement
  readonly count: HTMLElement
  readonly rows: readonly RowView[]
}

function groupByTurn(events: readonly ArchiveEvent[]): EventGroup[] {
  const groups: EventGroup[] = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last !== undefined && last.turn === event.turn) last.events.push(event)
    else groups.push({ turn: event.turn, events: [event] })
  }
  return groups
}

// 隠したRoleの行は一覧から外し、見出しには絞り込み中だけ表示件数を出す。全行が隠れたターンも見出しは残す
export function createEventList(events: readonly ArchiveEvent[]) {
  const element = el("div", "event-groups")
  const views: GroupView[] = []

  for (const group of groupByTurn(events)) {
    const details = el("details", "event-group")
    details.open = true
    const summary = el("summary", "event-group-summary")
    const count = el("span", "event-group-count")
    count.hidden = true
    summary.append(el("h3", "event-group-title", `ターン ${group.turn}`), count)
    const tokens = group.events.flatMap((event) =>
      event.tokens === null ? [] : [event.tokens.value],
    )
    if (tokens.length > 0)
      summary.append(
        el(
          "span",
          "event-group-tokens",
          `${formatTokens(tokens.reduce((a, b) => a + b, 0))} tokens`,
        ),
      )

    const list = el("ol", "event-list")
    const rows = group.events.map((event) => {
      const item = el("li", "event")
      item.append(createEventRow(event))
      list.append(item)
      return { item, role: roleKey(event) }
    })
    details.append(summary, list)
    element.append(details)
    views.push({ details, count, rows })
  }

  function setHiddenRoles(hidden: ReadonlySet<RoleKey>) {
    for (const view of views) {
      let visible = 0
      for (const row of view.rows) {
        row.item.hidden = hidden.has(row.role)
        if (!row.item.hidden) visible++
      }
      view.count.hidden = hidden.size === 0
      view.count.textContent = `${visible} / ${view.rows.length} 件`
      view.details.dataset.empty = String(visible === 0)
    }
  }

  return { element, setHiddenRoles }
}
