# こづゆばあちゃんの台所（アプリ）

会津を離れて暮らす人が、手に入る材料でこづゆを作るための案内。入力 → ばあちゃんの判定 → 結果 の 3 画面。
バックエンドなしの静的 Web アプリで、画面に出る事実はすべて `src/data/kozuyu.json` から出す（構成は `docs/architecture.md`）。

## コマンド

`app/` で実行する。Node.js 20.19 以上。

```bash
npm install          # セットアップ
npm run dev          # 開発サーバー（http://localhost:5173）
npm test             # 組み立てロジックと kozuyu.json のテスト
npm run lint         # oxlint
npm run format       # Prettier で整形（CI は format:check）
npm run build        # 本番ビルド（dist/）
```

## 写真の判定（API キー）

入力画面の「写真で読みとる」は `api/recognize.ts`（Vercel Functions）から Claude を呼ぶ。キーが無いときは判定できない旨を出し、手のチェックだけで最後まで進める。

- 手元: `app/.env.example` を `app/.env.local` にコピーして `ANTHROPIC_API_KEY` を書く（`npm run dev` のままで `/api/recognize` も動く）
- Vercel: プロジェクトの環境変数に `ANTHROPIC_API_KEY` を入れる
- 写真は判定に使うだけで、保存もログ出力もしない。AI には `pantry` の id 以外を返させない

## どこに何があるか

| パス | 中身 |
|---|---|
| `src/data/kozuyu.json` | 材料・配合・代わり・作り手・セリフ。チームが試作や電話の結果で書き換える |
| `src/data/types.ts` | `kozuyu.json` の形 |
| `src/lib/buildResult.ts` | チェックされた材料から結果を組み立てるルール（AI なし） |
| `src/lib/granny.ts` | ばあちゃんの 360° 画像（リポジトリ直下の `images/` から読み込む） |
| `src/screens/` | 入力・判定・結果の画面 |
| `api/recognize.ts` | 写真に写っている材料を判定する関数（`api/` に置いたファイルはすべて公開される関数になるので、テストは `test/` に置く） |

## kozuyu.json を書き換えるとき

- `templates` と `parts[].substitutes` は **上から順に** 見て、材料がそろう最初のものを使う。優先したいものを上に置く
- `requires` や `realId` には `pantry` の `id` を書く。つづりを間違えると `npm test` が落ちる
- 作り手・店の名前は `consent` が `confirmed` か `public_only` のときだけ画面に出る。`none` のときは「会津若松の事業者が作っているもの」と出る
- 試作が終わって値が確かになったら、`draft` を `false` にする（画面の「仮」の表示が消える）
