import type {
  Archive,
  ArchiveBlock,
  ArchiveEvent,
  ArchiveFile,
  ArchiveMessage,
  ArchiveMeta,
  ArchiveTokens,
  BlockType,
  TokenMethod,
} from "./types"

const BLOCK_TYPES: readonly BlockType[] = [
  "text",
  "thinking",
  "tool_use",
  "tool_result",
  "image",
  "file",
]
const TOKEN_METHODS: readonly TokenMethod[] = [
  "exact",
  "byte_ratio",
  "tokenized",
]
const BLOCK_ROLES = ["system", "user", "assistant", "tool"] as const
const MESSAGE_ROLES = ["user", "assistant"] as const

type Row = Readonly<Record<string, unknown>>

export function parseArchive(text: string): Archive {
  const lines = text.split("\n").filter((line) => line.trim() !== "")
  if (lines.length === 0) throw new Error("Archive is empty")

  const rows = lines.map((line, index) => {
    try {
      return asRow(JSON.parse(line), "record")
    } catch (error) {
      throw new Error(
        `Line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  })

  const [first, ...rest] = rows
  if (first === undefined) throw new Error("Archive is empty")
  const meta = parseMeta(first, 1)

  if (meta.content === "full") {
    const events = rest.map((row, index) => parseEvent(row, index + 2))
    checkSequence(events, "event")
    checkTurns(events)
    return { meta: { ...meta, content: "full" }, events }
  }
  const messages = rest.map((row, index) => parseMessage(row, index + 2))
  checkSequence(messages, "message")
  return { meta: { ...meta, content: "messages" }, messages }
}

function parseMeta(row: Row, line: number): ArchiveMeta {
  const at = `Line ${line}`
  if (row.record !== "meta") throw new Error(`${at}: first record must be meta`)
  if (row.schema_version !== "0.3")
    throw new Error(`${at}: unsupported schema_version`)
  if (row.content !== "full" && row.content !== "messages")
    throw new Error(`${at}: content must be full or messages`)
  return {
    record: "meta",
    schema_version: "0.3",
    content: row.content,
    harness: string(row.harness, `${at}: harness`),
    title: nullableString(row.title, `${at}: title`),
    source: nullableString(row.source, `${at}: source`),
    extracted_at: string(row.extracted_at, `${at}: extracted_at`),
  }
}

function parseEvent(row: Row, line: number): ArchiveEvent {
  const at = `Line ${line}`
  if (row.record !== "event")
    throw new Error(`${at}: full archive accepts only event records`)
  return {
    record: "event",
    seq: integer(row.seq, `${at}: seq`),
    turn: positiveInteger(row.turn, `${at}: turn`),
    req: nullablePositiveInteger(row.req, `${at}: req`),
    ts: nullableString(row.ts, `${at}: ts`),
    provider: nullableString(row.provider, `${at}: provider`),
    model: nullableString(row.model, `${at}: model`),
    block: parseBlock(asRow(row.block, `${at}: block`), at),
    tokens:
      row.tokens === null
        ? null
        : parseTokens(asRow(row.tokens, `${at}: tokens`), at),
  }
}

function parseBlock(row: Row, at: string): ArchiveBlock {
  const type = oneOf(row.type, BLOCK_TYPES, `${at}: block.type`)
  const role =
    row.role === null ? null : oneOf(row.role, BLOCK_ROLES, `${at}: block.role`)
  const file =
    row.file === null
      ? null
      : parseFile(asRow(row.file, `${at}: block.file`), at)
  const attachment = type === "image" || type === "file"
  if (attachment && file === null)
    throw new Error(`${at}: block.file is required for ${type} blocks`)
  if (!attachment && file !== null)
    throw new Error(`${at}: block.file must be null for ${type} blocks`)
  return {
    role,
    type,
    tool: nullableString(row.tool, `${at}: block.tool`),
    content: nullableString(row.content, `${at}: block.content`),
    file,
  }
}

function parseFile(row: Row, at: string): ArchiveFile {
  return {
    name: nullableString(row.name, `${at}: block.file.name`),
    media_type: string(row.media_type, `${at}: block.file.media_type`),
  }
}

function parseTokens(row: Row, at: string): ArchiveTokens {
  return {
    value: integer(row.value, `${at}: tokens.value`),
    method: oneOf(row.method, TOKEN_METHODS, `${at}: tokens.method`),
  }
}

function parseMessage(row: Row, line: number): ArchiveMessage {
  const at = `Line ${line}`
  if (row.record !== "message")
    throw new Error(`${at}: messages archive accepts only message records`)
  return {
    record: "message",
    seq: integer(row.seq, `${at}: seq`),
    ts: nullableString(row.ts, `${at}: ts`),
    role: oneOf(row.role, MESSAGE_ROLES, `${at}: role`),
    content: string(row.content, `${at}: content`),
  }
}

function checkSequence(
  records: readonly { readonly seq: number }[],
  kind: string,
) {
  records.forEach((record, index) => {
    if (record.seq !== index + 1)
      throw new Error(
        `${kind} seq must be consecutive from 1: expected ${index + 1}, got ${record.seq}`,
      )
  })
}

function checkTurns(events: readonly ArchiveEvent[]) {
  let previous = 0
  for (const event of events) {
    if (event.turn !== previous && event.turn !== previous + 1)
      throw new Error(
        `event ${event.seq}: turn must start at 1 and increase by at most 1`,
      )
    previous = event.turn
  }
}

function asRow(value: unknown, label: string): Row {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error(`${label} must be an object`)
  return value as Row
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string`)
  return value
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : string(value, label)
}

function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
    throw new Error(`${label} must be a non-negative integer`)
  return value
}

function positiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1)
    throw new Error(`${label} must be a positive integer`)
  return value
}

function nullablePositiveInteger(value: unknown, label: string): number | null {
  return value === null ? null : positiveInteger(value, label)
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): T {
  const match = allowed.find((candidate) => candidate === value)
  if (match === undefined)
    throw new Error(`${label} must be one of ${allowed.join(", ")}`)
  return match
}
