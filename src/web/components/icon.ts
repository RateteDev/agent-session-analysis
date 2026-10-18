// SVGの文字列からアイコン要素を作る。色は置かれた場所のcurrentColorを引き継ぐ
export function createIcon(svg: string): SVGElement {
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml")
  const icon = document.importNode(
    parsed.documentElement,
    true,
  ) as unknown as SVGElement
  icon.classList.add("icon")
  icon.setAttribute("aria-hidden", "true")
  return icon
}
