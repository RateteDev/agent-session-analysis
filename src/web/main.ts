import { parseArchive } from "../parse"
import { createThemeToggle, type Theme } from "./components/theme-toggle"
import { renderArchive } from "./render"

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id)
  if (element === null) throw new Error(`Missing element: #${id}`)
  return element as T
}

const DEFAULT_SAMPLE = "full-coffee-site.jsonl"

const fileInput = byId<HTMLInputElement>("file")
const errorBox = byId<HTMLParagraphElement>("error")
const viewer = byId<HTMLElement>("viewer")
const dropOverlay = byId<HTMLElement>("drop-overlay")

const THEME_KEY = "agent-session-analysis.theme"

function setupTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  const initial: Theme =
    stored === "light" || stored === "dark"
      ? stored
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
  document.documentElement.dataset.theme = initial
  byId("app-header").append(
    createThemeToggle(initial, (theme) => {
      document.documentElement.dataset.theme = theme
      localStorage.setItem(THEME_KEY, theme)
    }),
  )
}

function showError(message: string) {
  errorBox.textContent = message
  errorBox.hidden = false
}

function loadText(text: string, name: string, sample: string | null) {
  let archive: ReturnType<typeof parseArchive>
  try {
    archive = parseArchive(text)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    showError(
      `${name} を読み込めませんでした（${reason}）。1行1レコードのJSONLか確認してください。`,
    )
    return
  }
  errorBox.hidden = true
  viewer.hidden = false
  viewer.replaceChildren(renderArchive(archive, name))
  window.scrollTo({ top: 0 })

  const url = new URL(location.href)
  if (sample === null) url.searchParams.delete("sample")
  else url.searchParams.set("sample", sample)
  history.replaceState(null, "", url)
}

async function loadFile(file: File) {
  loadText(await file.text(), file.name, null)
}

async function loadSample(name: string) {
  const response = await fetch(`./samples/${encodeURIComponent(name)}`)
  if (!response.ok) {
    showError(
      `サンプル ${name} を取得できませんでした（HTTP ${response.status}）。`,
    )
    return
  }
  loadText(await response.text(), name, name)
}

function setupInputs() {
  byId("open").addEventListener("click", () => fileInput.click())
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0]
    fileInput.value = ""
    if (file !== undefined) void loadFile(file)
  })

  document.addEventListener("dragover", (event) => {
    event.preventDefault()
    if (event.dataTransfer?.types.includes("Files") === true)
      dropOverlay.hidden = false
  })
  document.addEventListener("dragleave", (event) => {
    if (event.relatedTarget === null) dropOverlay.hidden = true
  })
  document.addEventListener("drop", (event) => {
    event.preventDefault()
    dropOverlay.hidden = true
    const file = event.dataTransfer?.files[0]
    if (file !== undefined) void loadFile(file)
  })
  document.addEventListener("paste", (event) => {
    const file = event.clipboardData?.files[0]
    if (file !== undefined) {
      void loadFile(file)
      return
    }
    const text = event.clipboardData?.getData("text/plain") ?? ""
    if (text.trim() !== "") loadText(text, "貼り付けた内容", null)
  })
}

setupTheme()
setupInputs()
await loadSample(
  new URL(location.href).searchParams.get("sample") ?? DEFAULT_SAMPLE,
)
