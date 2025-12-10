<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import PersonnelForm from '../components/PersonnelForm.vue'

const router = useRouter()
const currentTab = ref('personnel')
const personnelList = ref<any[]>([])
const isLoading = ref(false)

// Modal State
const showModal = ref(false)
const isEditMode = ref(false)
const editingItem = ref<any>(null)

const navigateTo = (tab: string) => {
  currentTab.value = tab
  if (tab === 'personnel') fetchPersonnel()
}

const goToKiosk = () => {
    window.open(router.resolve({ name: 'kiosk' }).href, '_blank')
}

const handleLogout = () => {
  localStorage.removeItem('session')
  localStorage.removeItem('role')
  router.push('/')
}

const fetchPersonnel = async () => {
    isLoading.value = true
    try {
        const result = await api.post<any[]>('get_personnel', {}, localStorage.getItem('session') || '')
        if (Array.isArray(result)) {
            personnelList.value = result
        }
    } catch (e: any) {
        console.error(e)
        let msg = e.message || '未知錯誤'
        if (msg.includes('Permission')) msg = '權限不足 (Permission Denied)'
        alert('讀取資料失敗: ' + msg)
    } finally {
        isLoading.value = false
    }
}

const openAddModal = () => {
    isEditMode.value = false
    editingItem.value = null
    showModal.value = true
}

const openEditModal = (item: any) => {
    isEditMode.value = true
    editingItem.value = { ...item }
    showModal.value = true
}

const handleSave = async (payload: { isNew: boolean, data: any }) => {
    try {
        const action = 'update_personnel' // handles both add (isNew flag inside payload) and edit
        await api.post(action, payload, localStorage.getItem('session') || '')
        showModal.value = false
        fetchPersonnel() // Reload
        alert(payload.isNew ? '新增成功' : '更新成功')
    } catch (e: any) {
        let msg = e.message
        if (msg.includes('Permission Denied')) msg = '權限不足：請確認您有管理員權限'
        if (msg.includes('Account already exists')) msg = '帳號已存在'
        alert('錯誤: ' + msg)
    }
}

const handleDelete = async (account: string) => {
    if (!confirm('確定要刪除 ' + account + ' 嗎?')) return
    try {
        await api.post('delete_personnel', { account }, localStorage.getItem('session') || '')
        fetchPersonnel()
    } catch (e: any) {
        let msg = e.message
        if (msg.includes('Permission Denied')) msg = '權限不足'
        alert('刪除失敗: ' + msg)
    }
}

const showNotImplemented = (feature: string) => {
    alert(`${feature}功能將在下一階段實作`)
}

onMounted(() => {
    fetchPersonnel()
})
</script>

<template>
  <div class="admin-layout">
    <nav class="glass-panel sidebar">
      <div class="brand">管理後台</div>
      <ul>
        <li :class="{ active: currentTab === 'personnel' }" @click="navigateTo('personnel')">人員管理</li>
        <li :class="{ active: currentTab === 'logs' }" @click="navigateTo('logs')">系統日誌</li>
        <li :class="{ active: currentTab === 'attendance' }" @click="navigateTo('attendance')">出勤紀錄</li>
        <li class="separator"></li>
        <li @click="goToKiosk">人員出勤看板 ↗</li>
      </ul>
      <div class="logout" @click="handleLogout">登出</div>
    </nav>
    <main class="content">
      <header class="glass-panel top-bar">
        <h2>人員資料管理</h2>
        <button class="nano-btn" @click="openAddModal">新增人員</button>
      </header>
      
      <div v-if="isLoading" class="glass-panel loading-state">
          Loading data...
      </div>

      <div v-else class="glass-panel table-container">
        <table class="nano-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>帳號</th>
              <th>角色</th>
              <th>部門</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in personnelList" :key="user.Account">
              <td>{{ user.Name }}</td>
              <td>{{ user.Account }}</td>
              <td>{{ user.Role }}</td>
              <td>{{ user.Department }}</td>
              <td>
                  <span :class="user.IsActive ? 'status-working' : 'status-leave'">
                      {{ user.IsActive ? '啟用' : '停用' }}
                  </span>
              </td>
              <td class="actions-cell">
                  <button class="nano-btn secondary small" @click="openEditModal(user)">編輯</button>
                  <button class="nano-btn warning small" @click="handleDelete(user.Account)" v-if="user.Role !== 'admin'">刪除</button>
              </td>
            </tr>
            <tr v-if="personnelList.length === 0">
                <td colspan="6" class="no-data">尚無資料</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <PersonnelForm 
        :is-open="showModal"
        :is-edit="isEditMode"
        :initial-data="editingItem"
        @close="showModal = false"
        @save="handleSave"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  height: 100vh;
  box-sizing: border-box;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: var(--color-primary);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  flex: 1;
}

.sidebar li {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar li:hover, .sidebar li.active {
  background: rgba(255,255,255,0.1);
  color: var(--color-primary);
}

.sidebar li.separator {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 0.5rem 0;
  padding: 0;
  pointer-events: none;
}

.logout {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: color 0.2s;
  color: var(--color-text-muted);
}

.logout:hover {
  color: var(--color-warning);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.top-bar {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-container {
  padding: 1.5rem;
  flex: 1;
}

.nano-table {
  width: 100%;
  border-collapse: collapse;
}

.nano-table th {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: var(--color-text-muted);
}

.nano-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.nano-btn.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.actions-cell {
    display: flex;
    gap: 0.5rem;
}

.loading-state, .no-data {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-muted);
}
</style>
