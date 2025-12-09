# 派外單位人員管理系統 - 需求規格書 (SRS)

**版本**: V4.0
**日期**: 2025-12-09

## 1. 系統概述 (System Overview)
本系統旨在管理派外人員的出勤狀態，採用前後端分離架構。前端使用 **Vue.js** (Hosted on **GitHub Pages**) 提供 RWD 響應式介面，後端部署於 **Google Apps Script (GAS)**，並以 **Google Sheets** 作為分散式即時資料庫。

## 2. 系統架構 (System Architecture)

### 2.1 資料庫分流設計 (Database Splitting)
為解決 Google Sheets 單一檔案效能瓶頸與資料量限制，系統採用「年度分流」策略：
- **Main DB** (`AGY_派外管理_DB`): 僅儲存核心配置與當前狀態。
    - 表單: `Personnel`, `CurrentStatus`, `DeviceMapping`, `KioskConfig`.
- **Event DB** (`AGY_EventDB_YYYY`): 儲存系統操作紀錄 (如登入、資料變更)，每年自動建立新檔。
- **Log DB** (`AGY_LogDB_YYYY`): 儲存人員出勤打卡紀錄，每年自動建立新檔。

### 2.2 權限控管 (RBAC)
系統實作角色存取控制 (Role-Based Access Control)：
- **System Admin (`admin`)**:
    - 擁有完整權限。
    - 可新增/編輯/刪除人員資料。
    - 可檢視所有日誌 (System Logs, Attendance History)。
    - 可查看儀表板。

- **Supervisor (`supervisor`)**:
    - 可查詢所有人員的出勤紀錄。
    - 可查看儀表板。
    - **禁止** 存取人員管理功能 (選單隱藏 + API 端點防護)。
- **Staff (`staff`)**:
    - 一般同仁預設權限。
    - 可查看個人狀態或公開看板 (視設定而定)。
    - 可查看儀表板。
    - 可查詢個人出勤紀錄。
    - 可簽到/簽退。
    **禁止** 存取人員管理功能 (選單隱藏 + API 端點防護)。
---

## 3. 核心功能需求

### 3.1 管理員控制台 (Admin Dashboard)
- **介面設計**: 採用 RWD 側邊欄 (Sidebar) 佈局，支援桌面與行動裝置 (漢堡選單)。
- **首頁 (System Events)**: 預設顯示系統操作紀錄，以顏色區分 Event Level (INFO/WARN/ERROR)。
- **人員管理 (Personnel)**:
    - 卡片式/列表式介面 (Grid/Table)。
    - 支援新增、編輯、刪除人員。
    - **密碼安全**: 
        - 儲存時使用 SHA-256 加密。
        - 編輯時若欄位留空，則保留原密碼不變更。
        - 如果admin權限在資料庫的密碼欄位設定為admin，則admin帳號登入的密碼則改為admin，登入後在將密碼改為加密後之字串
- **出勤查詢 (Attendance)**: 檢視歷史打卡紀錄 (讀取自 `LogDB_YYYY`)。

### 3.2 現場 Kiosk 電子看板
- **功能**: 
    - 顯示全員即時狀態卡片 (顏色區分狀態)。
    - 返回功能按鈕，返回到首頁。
- **時鐘**: 顯示當前標準時間及年月日資訊。

### 3.3 行動裝置簽到 (Mobile Web)
- **流程**: 掃描 QR Code -> 自動帶入 Session -> 驗證裝置 UUID -> 選擇狀態 (上班/外出/下班)。
- **裝置綁定**: 首次使用需由管理員在後台輸入 UUID 進行綁定，確保裝置可信。
- **外出/出差**: 強制要求填寫「地點/事由」。

---

## 4. 資料結構 (Schema Definition)

### 4.1 Main DB
- **Personnel**: 人員名單
    - `Name`, `Account`, `Password` (Hashed), `Role`, `Email`, `UUID` (DeviceID), `Title`, `Department`, `IsActive`
- **CurrentStatus**: 最新狀態快照
    - `UserName`, `Status`, `LastUpdate`, `Location`, `Note`
- **DeviceMapping**: 裝置白名單
    - `DeviceUUID`, `UserName`, `LastLogin`, `CreatedAt`

### 4.2 Yearly DBs (2025...)
- **SystemLog** (in `EventDB_YYYY`):
    - `Timestamp`, `Level`, `Category`, `Message`, `User`, `Details`
- **AttendanceLog** (in `LogDB_YYYY`):
    - `Timestamp`, `UserName`, `Status`, `DeviceUUID`, `SessionID`, `Location`, `Note`, `IsRemote`

## 5. 安全性需求
- **API 通訊**: 使用 HTTPS，POST 方法採用 `text/plain` 繞過 GAS CORS 限制。
- **密碼存儲**: 禁止明文儲存，強制使用 SHA-256 Hash。
- **日誌審計**: 所有關鍵操作 (如刪除人員) 必須寫入 SystemLog，並記錄執行者 (Executor)。
