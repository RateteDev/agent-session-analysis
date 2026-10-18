// サンプルJSONL（samples/）が形式の正本。ここは各フィールドのnull条件と意味だけを補う。
// ファイルは1行1レコードで、先頭は必ずmeta、以降は`meta.content`に対応する種類だけが並ぶ。
// サブエージェントは、ハーネスが1つのセッションとして見せていても実体は別のセッションなので、この形式では扱わない。
// 親のアーカイブには、サブエージェントを呼んだtool_useと、その結果のtool_resultだけが入る。
// compaction（履歴の要約への置き換え）も扱わない。モデルの入力が元の履歴と地続きでなくなるため、別のセッションとして扱う。

export type ContentMode = "full" | "messages"

export interface ArchiveMeta {
  readonly record: "meta"
  readonly schema_version: "0.3"
  // fullはモデル入力に入った内容の全記録、messagesは人間のuser発言とassistantの本文だけ
  readonly content: ContentMode
  // 取り出し元のハーネス名。値の集合は固定しない
  readonly harness: string
  readonly title: string | null
  // 元セッションのURL。取得できなければnull
  readonly source: string | null
  // ISO 8601のUTC
  readonly extracted_at: string
}

export type BlockType =
  | "text"
  | "thinking"
  | "tool_use"
  | "tool_result"
  | "image"
  | "file"

// imageとfileのblockだけが持つ、添付の情報
export interface ArchiveFile {
  // ファイル名。不明ならnull
  readonly name: string | null
  // application/pdfのようなメディアタイプ
  readonly media_type: string
}

export interface ArchiveBlock {
  // nullは、system promptなど本文が記録されないがモデル入力に存在した領域を表す。このときtypeはtext、contentはnull
  readonly role: "system" | "user" | "assistant" | "tool" | null
  readonly type: BlockType
  // tool_useとtool_resultのときだけツール名が入り、それ以外はnull
  readonly tool: string | null
  // text: 本文
  // thinking: 思考テキスト。暗号化されて本文が読めないときはnull
  // tool_use: 入力をキー順に整えたコンパクトJSON文字列
  // tool_result: 結果のテキスト、または構造を持つ結果のJSON文字列
  // image, file: data URIまたはURL。中身を記録しないときはnull
  readonly content: string | null
  // imageとfileのとき必ず入り、それ以外はnull。添付はuserの本文の直後に、同じreqのeventとして並べる
  readonly file: ArchiveFile | null
}

export type TokenMethod = "exact" | "byte_ratio" | "tokenized"

export interface ArchiveTokens {
  // 0以上の整数。そのblockがコンテキストに占めるトークン数
  readonly value: number
  // exact: ハーネスが報告した使用量を、他のblockと分け合わず単独で占めた値
  // byte_ratio: 報告された使用量をバイト数の比で按分した推定値
  // tokenized: トークナイザーで数えた値
  readonly method: TokenMethod
}

export interface ArchiveEvent {
  readonly record: "event"
  // 1から始まる連番。ファイル内のevent同士で連続する
  readonly seq: number
  // userの1回の依頼から、assistantが最終回答を終えるまでの区間の番号（1から）。
  // 最初のuser発言より前のsystemなどは、最初のturnに入る。turnは1ずつ増える。
  // 中断されたturnなど、assistantの最終回答で終わるとは限らない
  readonly turn: number
  // モデルへ送った1回の呼び出しの番号（1から）。入力と、その応答が同じreqに入る。
  // 入力はuserの発言やツール結果など、その呼び出しで新しく加わったもので、会話の履歴は重複して書かない。
  // 1つのturnの中に複数のreqが入る。呼び出しを区別しないハーネスではnull
  readonly req: number | null
  // ISO 8601のUTC。不明ならnull
  readonly ts: string | null
  // reqの呼び出しに使われた推論プロバイダーのID。モデルと同様にセッションの途中で切り替わりうるため、eventごとに持つ。
  // reqがnull、または不明ならnull
  readonly provider: string | null
  // reqの呼び出しに使われたモデルID。reqがnull、または不明ならnull
  readonly model: string | null
  readonly block: ArchiveBlock
  // 数えられないときはnull（最後の応答など、後続の入力に戻らず按分できないものを含む）
  readonly tokens: ArchiveTokens | null
}

export interface ArchiveMessage {
  readonly record: "message"
  // 1から始まる連番。ファイル内のmessage同士で連続する
  readonly seq: number
  readonly ts: string | null
  readonly role: "user" | "assistant"
  readonly content: string
}

export type Archive =
  | {
      readonly meta: ArchiveMeta & { readonly content: "full" }
      readonly events: readonly ArchiveEvent[]
    }
  | {
      readonly meta: ArchiveMeta & { readonly content: "messages" }
      readonly messages: readonly ArchiveMessage[]
    }
