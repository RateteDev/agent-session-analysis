import type { ArchiveBlock, ArchiveEvent } from "../types"

// roleがnullのeventは、system promptなど本文が記録されない領域
export type RoleKey = NonNullable<ArchiveBlock["role"]> | "unrecorded"

export const ROLE_KEYS: readonly RoleKey[] = [
  "system",
  "user",
  "assistant",
  "tool",
  "unrecorded",
]

export function roleKey(event: ArchiveEvent): RoleKey {
  return event.block.role ?? "unrecorded"
}

export function countRoles(
  events: readonly ArchiveEvent[],
): Map<RoleKey, number> {
  const counts = new Map<RoleKey, number>()
  for (const event of events) {
    const key = roleKey(event)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}
