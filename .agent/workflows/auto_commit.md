---
description: 自動生成 Commit Message 並提交變更
---

1. 執行 `git status` 與 `git diff` 確認變更內容。
2. 生成 Commit Message**: 根據修改內容生成簡潔明確的 Commit Message (繁體中文)。
3.  **使用 Agent Workflow (推薦)**:
    - 若你使用 Agent 進行操作，可直接輸入指令 `@[/auto_commit]` 或 `/auto_commit`。
    - Agent 會自動執行 `git status` 確認變更，並呼叫上述腳本完成提交。