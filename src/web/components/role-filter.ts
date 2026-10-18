import { el } from "../dom"
import { ROLE_KEYS, type RoleKey } from "../role"

// 押したRoleの行を隠すチップの並び。件数が0のRoleは出さず、状態は保存しない
export function createRoleFilter(
  counts: ReadonlyMap<RoleKey, number>,
  onChange: (hidden: ReadonlySet<RoleKey>) => void,
): HTMLElement {
  const root = el("div", "role-filter")
  root.setAttribute("role", "group")
  root.setAttribute("aria-label", "Role")
  root.append(el("span", "role-filter-label", "Role"))

  const hidden = new Set<RoleKey>()
  for (const role of ROLE_KEYS) {
    const count = counts.get(role) ?? 0
    if (count === 0) continue
    const chip = el("button", "role-filter-chip")
    chip.type = "button"
    chip.setAttribute("aria-pressed", "true")
    chip.append(
      el("span", undefined, role === "unrecorded" ? "未記録" : role),
      el("span", "role-filter-count", String(count)),
    )
    chip.addEventListener("click", () => {
      if (hidden.has(role)) hidden.delete(role)
      else hidden.add(role)
      chip.setAttribute("aria-pressed", String(!hidden.has(role)))
      onChange(new Set(hidden))
    })
    root.append(chip)
  }
  return root
}
