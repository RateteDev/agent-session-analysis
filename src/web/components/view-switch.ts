import { el } from "../dom"

export type View = "detail" | "conversation"

const LABELS: readonly (readonly [View, string])[] = [
  ["detail", "詳細"],
  ["conversation", "会話"],
]

export function createViewSwitch(onChange: (view: View) => void): HTMLElement {
  const group = el("div", "tabs")
  group.setAttribute("role", "group")
  group.setAttribute("aria-label", "表示の切り替え")
  const buttons = LABELS.map(([view, label]) => {
    const button = el("button", "tabs-button", label)
    button.type = "button"
    button.setAttribute("aria-pressed", String(view === "detail"))
    button.addEventListener("click", () => {
      for (const [other, otherButton] of buttons)
        otherButton.setAttribute("aria-pressed", String(other === view))
      onChange(view)
    })
    group.append(button)
    return [view, button] as const
  })
  return group
}
