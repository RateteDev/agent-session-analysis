export function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  return Number.isNaN(date.getTime()) ? ts : date.toLocaleString("ja-JP")
}

export function formatTokens(value: number): string {
  return value.toLocaleString("ja-JP")
}
