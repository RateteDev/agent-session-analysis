# agent-session-analysis

エージェントの会話を保存するJSONL形式と、その閲覧UIです。
会話をこの形式へ変換する処理は持ちません。

## 形式

`samples/`のJSONLが形式の正本です。
フィールドのnull条件と意味は`src/types.ts`のコメントにあります。

- `full-coffee-site.jsonl`は、マウントも外部アクセスもない隔離環境でOpenCodeにWebサイトを作らせた実際のセッションを、`full`形式にしたものです。
  5ターン、81回のモデル呼び出し、DeepSeekの生の思考、ツールの入出力を含みます。
- `full-all-cases.jsonl`は、画像・モデルとプロバイダーの切替・トークンの各算出方法・nullになるフィールドをそろえた`full`形式です。
- `full-without-tokens.jsonl`は、トークン数もリクエスト番号も持たないハーネスの`full`形式です。
- `messages-all-cases.jsonl`は、`full-all-cases.jsonl`と同じ会話を、userの発言とassistantの本文だけにした`messages`形式です。

## 閲覧UI

Bun（1.4系）で動きます。

```sh
bun install
bun run src/server.ts --host 0.0.0.0 --port 4180
```

`--host`と`--port`で待ち受け先を変えられます。
`--dev`を付けると、編集が再起動なしで画面に反映されます。

- 起動直後は、`samples/full-coffee-site.jsonl`を表示します。
- ヘッダーの「開く」・ドラッグ＆ドロップ・クリップボードからの貼り付けで、手元のJSONLを開けます。
- `full`形式の「詳細」では、Roleのチップを押すと、その役割の行を隠せます。
- `?sample=full-all-cases.jsonl`のようにサンプルのファイル名を付けると、ほかのサンプルを開けます。

## 検査

```sh
bunx biome check .
bunx tsc --noEmit
bun test tests
```
