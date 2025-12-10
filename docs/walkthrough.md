# System Walkthrough (V4.0)

本系統已依據 SRS V4.0 完成前後端程式碼建置，並採用 **Nano Banana** 設計風格進行 UI 優化。

## 1. 檔案結構 (Structure)

- **Backend (`/backend`)**: Google Apps Script 專案程式碼。
  - `main.js`: API 進入點。
  - `db.js`: 資料庫分流邏輯。
  - `auth.js`: 驗證與權限。
  - `handlers.js`: 業務邏輯。
  
- **Frontend (`/frontend`)**: Vue 3 + Vite 專案。
  - `src/assets/base.css`: **Nano Banana** 核心樣式 (Glassmorphism)。
  - `src/views/`: Login, Kiosk, Admin, Mobile 頁面。

## 2. 部署說明 (Deployment)

### 前端 (Frontend)
1. 進入目錄: `cd frontend`
2. 安裝套件: `npm install`
3. 啟動開發伺服器: `npm run dev`
4. 建置生產版本: `npm run build`
   - 產出檔案位於 `dist/`，可部署至 GitHub Pages。
   - 若要部署至 GAS，需將 HTML/CSS/JS 合併為單一檔案 (需額外設置)。

### 後端 (Backend)
1. 進入目錄: `cd backend`
2. 使用 `clasp` 推送至 Google Apps Script 專案。
   ```bash
   clasp login
   clasp create --type webapp --title "派外人員管理系統_V4"
   clasp push
   ```
3. 部署為 Web App，設定權限為 `Anyone (Anonymous)` 以供 Kiosk 使用。

## 3. 自動化部屬 (Automated Deployment)

本系統提供兩套部屬機制：**本地腳本 (Local Scripts)** 與 **GitHub Actions (CI/CD)**。

### 3.1 本地腳本部屬 (Windows PowerShell)
位於 `tools/` 目錄下的自動化腳本：

1.  **Backend Only**:
    ```powershell
    .\tools\deploy_backend.ps1
    ```
    *需先執行 `clasp login`*

2.  **Frontend Only**:
    ```powershell
    .\tools\deploy_frontend.ps1
    ```
    *會自動執行 Build 並推送到 `gh-pages` 分支*

3.  **One-Click Deploy (Full System)**:
    ```powershell
    .\tools\deploy_all.ps1
    ```

### 3.2 CI/CD (GitHub Actions)
已配置 `.github/workflows/deploy.yml`，推送到 `master` 分支即觸發。

**設定需求 (Secrets)**:
在 GitHub Repository Settings -> Secrets and variables -> Actions 新增：
- `CLASP_JSON`: 您的 `.clasp.json` 內容。
- `CLASPRC_JSON`: 您的 `~/.clasprc.json` 內容 (包含 token)。
- `GAS_TOKEN`: (若使用不同的驗證方式，通常 CLASPRC 已包含)。

### 1. 取得您的網址
請依照下列步驟存取您的應用程式：

**Frontend (使用者介面):**
- 網址: `https://Ryan-itri.github.io/派外單位人員管理/` (需等待 GitHub Pages 生效)

**Backend (後端 API):**
- 請確認您的 `clasp deployments` 輸出的 Web App URL (格式為 `https://script.google.com/macros/s/.../exec`)。
- **重要**: 您必須將此 URL 更新至 `frontend/src/config.ts` 中的 `apiUrl` 欄位，並再次執行 `deploy_frontend.ps1`，前端才能正常連線。

### 2. 下一步 (Next Steps)
1. **設定 API**: 開啟 `frontend/src/config.ts`，填入您的 GAS URL。
2. **重新部屬前端**: 執行 `.\tools\deploy_frontend.ps1`。
3. **測試登入**: 使用 `admin` / `admin` 登入。

- [x] **UI Check**: 開啟 `LoginView` 或 `KioskBoard`，確認是否有高級毛玻璃效果與動態背景。
- [x] **Logic Check**: 檢查 `backend/db.js` 中的年份分流邏輯 (`getYearlyDb`)。
- [x] **Auth Check**: 檢查 `init admin` 密碼重置邏輯。

## 4. 下一步
- 測試 `clasp push` 是否成功。
- 實際掃描 Kiosk 上的 QR Code 進行簽到流程測試。
