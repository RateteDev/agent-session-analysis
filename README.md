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

```sh
bun install
just serve
```

既定では`0.0.0.0:4180`で待ち受けます。
`just serve <host> <port>`で変更できます。

- 起動直後は、`samples/full-coffee-site.jsonl`を表示します。
- ヘッダーの「開く」・ドラッグ＆ドロップ・クリップボードからの貼り付けで、手元のJSONLを開けます。
- `full`形式の「詳細」では、Roleのチップを押すと、その役割の行を隠せます。
- `?sample=full-all-cases.jsonl`のようにサンプルのファイル名を付けると、ほかのサンプルを開けます。

## 検査

```sh
just ci-local
```
