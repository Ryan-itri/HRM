# 實作計畫 (Implementation Plan) - V4.0 System Re-implementation

**目標**: 依據 SRS V4.0 重建系統，並採用 "Nano Banana" (Premium/High-End) 設計風格進行前端開發。

## 1. 設計理念 (Nano Banana UI)
為達成「前衛、高級、流暢」的使用者體驗，將採用以下設計語彙：
- **Glassmorphism (毛玻璃特效)**: 大量使用背景模糊與半透明層次，營造現代感。
- **Dynamic Gradients (動態漸層)**: 避免單色，使用類似 Apple/Google 的高質感漸層背景。
- **Fluid Typography**: 使用 Inter/Roboto 字體，搭配流暢的排版與呼吸感間距。
- **Micro-interactions**: 按鈕懸停、卡片載入時加入細微動畫。
- **Dark/Light Mode**: 預設採用深色質感 (High-Tech feel) 或自動適應。

## 2. 系統架構目錄
```text
/
├── backend/            # Google Apps Script 專案
│   ├── main.js        # 核心邏輯
│   ├── db.js          # 資料庫操作 (Main/Event/Log)
│   ├── auth.js        # 驗證與 Session
│   └── api.js         # doGet/doPost 路由
├── frontend/           # Vue 3 前端專案
│   ├── src/
│   │   ├── components/
│   │   │   ├── NanoCard.vue      # 高質感卡片元件
│   │   │   ├── NanoButton.vue    # 流光按鈕元件
│   │   │   └── ...
│   │   ├── views/
│   │   │   ├── AdminDashboard.vue
│   │   │   ├── KioskBoard.vue
│   │   │   └── MobileCheckIn.vue
│   │   ├── assets/
│   │   │   └── style.css         # 核心變數 (CSS Variables)
│   │   └── ...
│   └── index.html
└── docs/               # 文件
```

## 3. 變更清單 (Proposed Changes)

### Backend (Google Apps Script)
#### [NEW] [backend/main.js](file:///d:/00-Desktop/派外單位人員管理/backend/main.js)
- 進入點 `doGet`, `doPost`。
- 路由派發器。

#### [NEW] [backend/db.js](file:///d:/00-Desktop/派外單位人員管理/backend/db.js)
- `getDbHandle(type, year)`: 動態取得 Spreadsheet ID。
- CRUD 封裝。

#### [NEW] [backend/auth.js](file:///d:/00-Desktop/派外單位人員管理/backend/auth.js)
- SHA-256 驗證邏輯。
- RBAC 權限檢查。

### Frontend (Vue 3 + Nano Design)
#### [NEW] [frontend/index.html](file:///d:/00-Desktop/派外單位人員管理/frontend/index.html)
- 引入 Vue 3 CDN (保持輕量，或使用 Vite 建置)。
- *建議使用 Vite 建置專案以利開發管理，但最終部署需編譯為單一 HTML 給 GAS，或 Hosted on GitHub Pages.*
- **決策**: 依據 SRS "Hosted on GitHub Pages"，前端為獨立 SPA。採用 Vite 建置。

#### [NEW] [frontend/src/assets/base.css](file:///d:/00-Desktop/派外單位人員管理/frontend/src/assets/base.css)
- 定義 `:root` 變數 (Colors, Spacing, Shadows)。
- 實現 Glassmorphism class。

#### [NEW] [frontend/src/views/KioskBoard.vue](file:///d:/00-Desktop/派外單位人員管理/frontend/src/views/KioskBoard.vue)
- 狀態牆實作。
- QR Code 動態生成介面。

#### [NEW] [frontend/src/views/AdminDashboard.vue](file:///d:/00-Desktop/派外單位人員管理/frontend/src/views/AdminDashboard.vue)
- 側邊欄佈局。
- 人員管理 CRUD 介面。

## 4. 驗證計畫 (Verification Plan)
### Automated Tests
- 前端 Component 單元測試 (Optional)。
- 檢查 CSS 變數是否正確套用。

### Manual Verification
1. **Visual Check**: 確認 UI 是否符合 "Nano Banana" (高級感)。
2. **Kiosk Flow**: 模擬 QR Code 刷新與掃描。
3. **Admin Flow**: 測試人員增刪改查與權限控管。
4. **Data Persistence**: 確認 `ShowOnBoard` 欄位正確儲存與讀取。
5. **Board Visibility**: 確認 Kiosk 看板正確顯示勾選的人員 (Debugging Item).
