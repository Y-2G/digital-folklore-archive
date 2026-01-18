# Execute Plan Command

計画ドキュメントに基づいて実装を実行します。project-orchestratorエージェントを使用して、計画に記載されたタスクを適切なサブエージェントに振り分け、並列実行で効率的に実装を進めます。

## Input

計画ファイルのパス: $ARGUMENTS

$ARGUMENTSが空の場合は、`docs/tasks/`内の計画ファイル一覧を表示して選択を促してください。

## Instructions

1. **計画ファイルの読み込み**
   - 指定された計画ファイル（または`docs/tasks/tasks-001.md`）を読み込む
   - 未完了のタスクを特定
   - 依存関係を確認

2. **実行対象の確認**
   - 全タスクを実行するか、特定のPhaseのみか確認
   - 並列実行可能なタスクをグループ化
   - 依存関係のあるタスクは順次実行を計画

3. **project-orchestratorを起動**
   以下の実行計画に従って作業を調整：

   ### 実行フロー
   ```
   Phase 1（並列実行）
   ├── Task A → backend-specialist
   ├── Task B → frontend-implementer
   └── Task C → infra-implementer

   [Phase 1完了を待機]

   Phase 2（順次/並列実行）
   ├── Task D (depends on A) → frontend-implementer
   └── Task E (depends on B, C) → backend-specialist

   [Phase 2完了を待機]

   Phase 3（レビュー）
   └── All changes → multi-perspective-reviewer
   ```

4. **各タスクの実行**
   適切なエージェントをTaskツールで起動：
   - `subagent_type`: 計画で指定されたエージェント
   - `prompt`: タスクの詳細指示（コンテキスト含む）
   - 並列可能なタスクは同時に複数起動

5. **進捗管理**
   - 各タスク完了時に計画ファイルのチェックリストを更新
   - `[ ]` → `[x]` に変更
   - エラーや問題が発生した場合はメモを追記

6. **完了報告**
   - 実行結果のサマリー
   - 完了したタスク / 残りのタスク
   - 発生した問題とその対処
   - 次のステップの提案

## Execution Rules

### 並列実行の原則
- 依存関係のないタスクは積極的に並列実行
- 単一メッセージ内で複数のTaskツールを呼び出す
- 各エージェントに十分なコンテキストを提供

### 品質保証
- 実装後は必ず`multi-perspective-reviewer`でレビュー
- テストが必要なコードはテスト実装も含める
- i18n対応が必要な場合は日本語/英語両方を実装

### エラー処理
- タスク失敗時は原因を分析
- 修正可能な場合は再実行
- ブロッカーがある場合はユーザーに報告して判断を仰ぐ

## Project Context

- このプロジェクトはDigital Folklore Archive（デジタル伝承資料庫）です
- CLAUDE.mdの作業ルールに従います
- 既存コードのスタイル・パターンを踏襲
- CSS Modules + CSS Variablesでスタイリング

## Agent Mapping

計画のタスクを実行するエージェント対応：

| 計画での記載 | subagent_type |
|-------------|---------------|
| バックエンド実装 | backend-specialist |
| フロントエンド実装 | frontend-implementer |
| インフラ実装 | infra-implementer |
| フロントエンド設計 | frontend-architect |
| バックエンド設計 | backend-architect |
| インフラ設計 | infra-architect |
| レビュー | multi-perspective-reviewer |
| 調査・探索 | Explore |
| 汎用タスク | general-purpose |

## Example Usage

```
/execute-plan docs/tasks/tasks-001.md
/execute-plan docs/tasks/plan-catalog-feature.md
/execute-plan  # ファイル選択プロンプトを表示
```
