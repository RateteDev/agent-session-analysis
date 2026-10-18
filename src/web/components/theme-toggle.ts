import moonIcon from "../assets/icons/moon.svg" with { type: "text" }
import sunIcon from "../assets/icons/sun.svg" with { type: "text" }
import { el } from "../dom"
import { createIcon } from "./icon"

export type Theme = "light" | "dark"

// 今のテーマのアイコンを出し、押すとライトとダークを切り替える。反映と保存は呼び出し側が行う
export function createThemeToggle(
  initial: Theme,
  onChange: (theme: Theme) => void,
): HTMLButtonElement {
  const button = el("button", "button")
  button.type = "button"
  button.dataset.size = "icon"
  let theme = initial

  const show = () => {
    button.replaceChildren(createIcon(theme === "dark" ? moonIcon : sunIcon))
    const label = theme === "dark" ? "ライトに切り替え" : "ダークに切り替え"
    button.setAttribute("aria-label", label)
    button.title = label
  }
  button.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark"
    show()
    onChange(theme)
  })
  show()
  return button
}
