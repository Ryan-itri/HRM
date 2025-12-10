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
    - [/] **Frontend (Vue)**
        - [x] Create `PersonnelForm.vue` (Modal component).
        - [x] Update `AdminDashboard.vue` to fetch data from API.
        - [x] Integrate Add/Edit/Delete actions with API.
        - [x] Debug "Permission Denied" issue due to Role case sensitivity.

