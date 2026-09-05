# CLAUDE.md

Claude Code 向けのプロジェクト設定です。共通ルールは AGENTS.md にまとめており、ここから import しています。

@AGENTS.md

## Claude Code 固有の補足

- 応答・説明・コミットメッセージの body は日本語で書く（コミットの summary は英語）
- スタックやコマンドが `AGENTS.md` で「未定」のままの間は、ビルド・テストコマンドを推測して実行しない
- 企画段階の作業（アイデア整理、docs 更新）では、`docs/hackathon-overview.md` のバリュープロポジションキャンバス（対象 / 課題 / 価値）の枠組みに沿って整理する
- 新しいドキュメントは `docs/` 配下に Markdown で作成する
- Decidim への投稿文を作る場合は、`docs/hackathon-overview.md` の投稿テンプレートの見出し順に従う

## よく使う参照先

- 企画概要・スケジュール・投稿テンプレート: `docs/hackathon-overview.md`
- PR の書き方: `.github/PULL_REQUEST_TEMPLATE.md`
- Issue の書き方: `.github/ISSUE_TEMPLATE/`
