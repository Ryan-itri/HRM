# Deployment Implementation Plan

本計畫旨在建立自動化部屬流程，涵蓋後端 (Google Apps Script) 與前端 (GitHub Pages)。

## 1. 自動化策略

### 雙軌並行 (Hybrid Approach)
1.  **Local Automation Scripts (PowerShell)**: 供開發者在本地快速執行部屬，不依賴 GitHub CI/CD。
2.  **GitHub Actions (CI/CD)**: 當程式碼推送到 GitHub 時自動部屬，適合團隊協作與正式發布。

## 2. 工具鏈準備 (Prerequisites)

- **Backend**: `google-clasp` (需本地登入 `clasp login`).
- **Frontend**: `gh-pages` npm 套件 (用於推送到 gh-pages 分支).

## 3. 實作細節

### 3.1 本地腳本 (Local Scripts)

#### [NEW] [tools/deploy_backend.ps1](file:///d:/00-Desktop/派外單位人員管理/tools/deploy_backend.ps1)
- 切換至 `backend/` 目錄。
- 執行 `clasp push`。
- 檢查回傳狀態。

#### [NEW] [tools/deploy_frontend.ps1](file:///d:/00-Desktop/派外單位人員管理/tools/deploy_frontend.ps1)
- 切換至 `frontend/` 目錄。
- 執行 `npm run build`。
- 執行 `git add dist -f` && `git commit` && `git subtree push --prefix frontend/dist origin gh-pages` (或是使用 `gh-pages -d dist` 更簡單)。
- **決策**: 使用 `gh-pages` npm package，因為 `git subtree` 在 Windows PowerShell有時會有路徑問題且較複雜。

#### [NEW] [tools/deploy_all.ps1](file:///d:/00-Desktop/派外單位人員管理/tools/deploy_all.ps1)
- 依序呼叫上述兩者。

### 3.2 CI/CD (GitHub Actions)

#### [NEW] [.github/workflows/deploy.yml](file:///d:/00-Desktop/派外單位人員管理/.github/workflows/deploy.yml)
- **Job 1: Deploy Backend**
    - Setup Node.js.
    - Install `clasp`.
    - Create `.clasp.json` from secrets.
    - Create `~/.clasprc.json` from secrets (`CLASPRC`).
    - Run `clasp push`.
- **Job 2: Deploy Frontend**
    - Setup Node.js.
    - `npm install` & `npm run build`.
    - Deploy to `gh-pages` branch using `peaceiris/actions-gh-pages`.

## 4. 驗證步驟
1. 執行 `tools/deploy_backend.ps1`，確認 GAS 收到更新。
2. 執行 `tools/deploy_frontend.ps1`，確認 GitHub Pages 更新。
3. (Optional) 推送至 GitHub，觀察 Actions Tab。
