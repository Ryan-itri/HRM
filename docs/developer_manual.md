# 派外單位人員管理系統 - 開發者手冊

**版本**: V4.0
**日期**: 2025-12-09

## 1. 環境需求 (Prerequisites)
- **Node.js**: v18+ (LTS)
- **Google 帳號**: 需開啟 Google Apps Script API 權限。
- **Clasp**: `npm install -g @google/clasp`
- **Git**: 版本控制

## 2. 專案結構 (Project Structure)
```text
/
├── .agent/                 # Agent 相關設定
├── docs/                   # 系統文件 (SRS, User Manual)
├── src/
│   ├── frontend/           # 前端 (Vue 3 + Vite + Tailwind)
│   │   ├── src/views/      # 頁面 (Admin, Login, Kiosk)
│   │   └── .env            # 前端環境變數 (API URL)
│   └── backend/            # 後端 (Google Apps Script)
│       └── main.js         # 主要邏輯 (V4 Architecture)
├── tools/                  # 自動化腳本
│   ├── push_backend.ps1    # PowerShell 部署腳本
│   └── init_db.js          # 資料庫初始化腳本
├── package.json            # 專案根目錄管理腳本
└── README.md
```

## 3. 快速上手 (Quick Start)

### 3.1 安裝依賴
在專案根目錄執行：
```bash
npm run install:frontend
```

### 3.2 後端部署 (Backend Deployment)
1. **登入 Clasp** (首次使用):
   ```bash
   cd src/backend
   clasp login
   ```
2. **推送到 Google**:
   回到根目錄，執行：
   ```bash
   npm run deploy:backend
   ```
   *此指令會強制覆寫雲端上的 `main.js`。*

3. **發布 Web App**:
   - 進入 [GAS 網頁版](https://script.google.com/)。
   - 點擊「部署」->「建立新部署」。
   - 類型：「網頁應用程式」。
   - 存取權：「所有人 (Anyone)」。
   - **複製 URL** 並更新至 `src/frontend/.env`。

### 3.3 資料庫初始化 (Database Check)
首次部署或更換 Google 帳號後，需初始化資料庫：
```bash
npm run init:db
```
*腳本會自動讀取 .env 中的網址並觸發後端初始化。*

### 3.4 前端開發 (Frontend Dev)
啟動本地開發伺服器：
```bash
npm run dev
```
瀏覽器開啟 `http://localhost:5173`。

---

## 4. 發布至 GitHub Pages

本專案前端支援部署至 GitHub Pages 靜態託管。

### 4.1 建置 (Build)
```bash
cd src/frontend
npm run build
```
產出的靜態檔案位於 `src/frontend/dist`。

### 4.2 部署設定
建議設定 GitHub Actions 自動化部署：
1. 建立 `.github/workflows/deploy.yml`。
2. 設定觸發條件為 Push to `main`。
3. Build 步驟需包含 `npm install` 與 `npm run build`。
4. 使用 `actions/upload-pages-artifact` 上傳 `dist` 資料夾。

---

## 5. 架構說明 (Architecture Notes)

### 5.1 後端設計 (V4 Spec)
- **單一入口**: 所有請求由 `doPost` / `doGet` 統一路由。
- **資料庫分流**:
  - `MainDB`: 設定檔與當前狀態。
  - `EventDB_{Year}`: 系統日誌 (Lazy Create)。
  - `LogDB_{Year}`: 出勤紀錄 (Lazy Create)。
- **安全性**:
  - 密碼採用 SHA-256 加密。
  - 關鍵操作 (新增/刪除) 需驗證 `executor` 權限 (RBAC)。

### 5.2 前端設計
- **框架**: Vue 3 (Composition API)。
- **樣式**: Tailwind CSS (Tech/Dark Theme)。
- **認證**: `useAuth` Composable 處理 Session 與 LocalStorage。
- **路徑**:
  - `/login`: 登入頁。
  - `/admin`: 管理後台 (需 Auth)。
  - `/kiosk`: 公開看板。
  - `/checkin`: 行動打卡頁。

## 6. 常見問題
- **Error 302**: GAS Web App 預設會轉址，若 API Client 未處理 Redirect 會拿到空回應 (`init_db.js` 已修正此問題)。
- **CORS Error**: 請確保 POST 請求使用 `text/plain` Content-Type，避免觸發 Preflight。
