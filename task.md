# Task List: Automated Deployment Setup

- [x] **Initial Assessment**
    - [x] Check current `clasp` configuration.
    - [x] Check `package.json` for build scripts.
- [x] **Deployment Scripts (Local Automation)**
    - [x] Create `tools/deploy_backend.ps1` (GAS Clasp Push).
    - [x] Create `tools/deploy_frontend.ps1` (Build + Deploy to GH Pages).
    - [x] Create `tools/deploy_all.ps1` (Master script).
- [x] **CI/CD Configuration (GitHub Actions)**
    - [x] Create `.github/workflows/deploy.yml`.
    - [x] Document secrets setup (`GAS_TOKEN`, `GITHUB_TOKEN`).
- [x] **Documentation**
    - [x] Update `walkthrough.md` with deployment instructions.

- [x] **UI Localization (Traditional Chinese)**
    - [x] Translate `LoginView.vue`
    - [x] Translate `AdminDashboard.vue`
    - [x] Translate `KioskBoard.vue`
    - [x] Translate `MobileCheckIn.vue`

- [x] **Personnel Management Implementation**
    - [x] **Backend (GAS)**
        - [x] Verify/Update `db.js` for User CRUD.
        - [x] Implement `getUsers`, `addUser`, `updateUser`, `deleteUser` in `handlers.js`.
        - [x] Update `main.js` routing.
    - [x] **Frontend (Vue)**
        - [x] Create `PersonnelForm.vue` (Modal component).
        - [x] Update `AdminDashboard.vue` to fetch data from API.
        - [x] Integrate Add/Edit/Delete actions with API.
        - [x] Debug "Permission Denied" and "Password Hashing" issues (Version 8 fix).

- [x] **Device Binding Feature (QR Code)**
    - [x] **Frontend Setup**
        - [x] Install `qrcode` package.
        - [x] Create `BindDevice.vue` (Mobile UI).
        - [x] Update `router/index.ts`.
        - [x] Update `AdminDashboard.vue` (QR Button & Modal).
    - [x] **Backend Implementation**
        - [x] Update `main.js` (Route `bind_device`).
        - [x] Update `handlers.js` (`handleBindDevice`).

- [x] **QR Code Login (Kiosk Mode)**
    - [x] **Backend Setup**
        - [x] Update `db.js` (KioskDevices sheet access).
        - [x] Update `main.js` (Routes: `check_kiosk`, `init_qr`, `poll_qr`, `approve_qr`, `kiosk_crud`).
        - [x] Update `auth.js` (QR Session logic).
        - [x] Update `handlers.js` (Kiosk CRUD & Logic).
    - [x] **Frontend Implementation**
        - [x] Update `LoginView.vue` (Kiosk mode & QR display).
        - [x] Create `AuthorizeLogin.vue`.
        - [x] Update `AdminDashboard.vue` (Device Management Tab).
        - [x] Update `router/index.ts`.

- [x] **Passive Kiosk Mode**
    - [x] Update `LoginView.vue` (Clock, Remove redirection).
    - [x] Update `AuthorizeLogin.vue` (Auto Login & Redirect).

- [x] **System Renaming**
    - [x] Update `backend/main.js`.
    - [x] Update `frontend/index.html`.
    - [x] Update `LoginView.vue` (Multi-line title).
    - [x] Update `AdminDashboard.vue` link text.

- [x] **Refine System Name (3-Line)**
    - [x] Update `backend/main.js`.
    - [x] Update `frontend/index.html`.
    - [x] Update `LoginView.vue` (3-line title).
    - [x] Update `KioskBoard.vue` (Title).

- [x] **Final Rename (Remove Dept)**
    - [x] Update `backend/main.js`.
    - [x] Update `frontend/index.html`.
    - [x] Update `LoginView.vue` (2-line title).
    - [x] Update `KioskBoard.vue` (2-line title).

- [x] **UI Layout Adjustments**
    - [x] Update `LoginView.vue` (Remove subtitle, Move Kiosk Name).

- [x] **Strict Device UUID Login**
    - [x] Update `AuthorizeLogin.vue`.
        - Ensure UUID generation.
- [x] **Strict Device UUID Login**
    - [x] Update `AuthorizeLogin.vue`.
        - Ensure UUID generation.
        - If login fails -> Show Error (Access Denied) & Display UUID.
        - Remove fallback to manual login (`router.push('/')`).
    - [x] **Fix**: Always validate UUID (Ignore existing session shortcut).
        - If device not bound -> Block (even if session exists).
        - If bound -> Login as bound user.
