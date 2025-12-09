---
trigger: always_on
---

# 自動提交規則

當你完成程式碼修改並經過驗證確認後，必須執行以下步驟：

1.  **生成 Commit Message**: 根據修改內容生成簡潔明確的 Commit Message (繁體中文)。
2.  **執行提交**: 使用 `tools/commit_changes.ps1` 腳本進行提交。
    - 指令範例: `powershell -ExecutionPolicy Bypass -File tools/commit_changes.ps1 -Message "你的 Commit Message"`
3.  **使用 Agent Workflow (推薦)**:
    - 若你使用 Agent 進行操作，可直接輸入指令 `@[/auto_commit]` 或 `/auto_commit`。
    - Agent 會自動執行 `git status` 確認變更，並呼叫上述腳本完成提交。