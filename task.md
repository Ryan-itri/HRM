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

