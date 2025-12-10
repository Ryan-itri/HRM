<template>
  <div class="bind-container">
    <div class="card">
      <h2>裝置綁定</h2>
      
      <div v-if="account" class="info-group">
        <label>綁定帳號</label>
        <div class="value">{{ account }}</div>
      </div>
      
      <div class="info-group">
        <label>本機裝置 ID (UUID)</label>
        <div class="value uuid">{{ deviceUuid }}</div>
      </div>

      <div class="actions">
        <button 
          @click="handleBind" 
          :disabled="isBinding || !account"
          class="bind-btn"
        >
          {{ isBinding ? '綁定中...' : '確認綁定此裝置' }}
        </button>
      </div>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const account = ref('')
const deviceUuid = ref('')
const isBinding = ref(false)
const message = ref('')
const messageType = ref('info')

onMounted(() => {
  // Get Account from URL
  const acc = route.query.account as string
  if (acc) {
    account.value = acc
  } else {
    showMessage('錯誤：無效的綁定連結 (缺少帳號)', 'error')
  }

  // Get or Generate UUID
  let uuid = localStorage.getItem('device_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID ? crypto.randomUUID() : generateLegacyUUID()
    localStorage.setItem('device_uuid', uuid)
  }
  deviceUuid.value = uuid
})

function generateLegacyUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function handleBind() {
  if (!account.value || !deviceUuid.value) return

  isBinding.value = true
  message.value = ''

  try {
    await api.post('bind_device', {
      account: account.value,
      uuid: deviceUuid.value
    })
    showMessage('綁定成功！您現在可以使用此裝置進行打卡。', 'success')
  } catch (error: any) {
    showMessage('綁定失敗: ' + error.message, 'error')
  } finally {
    isBinding.value = false
  }
}

function showMessage(msg: string, type: 'info' | 'success' | 'error') {
  message.value = msg
  messageType.value = type
}
</script>

<style scoped>
.bind-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  color: #1a1a1a;
  margin-bottom: 2rem;
}

.info-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  word-break: break-all;
}

.uuid {
  font-family: monospace;
  font-size: 0.9rem;
}

.bind-btn {
  width: 100%;
  padding: 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bind-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.bind-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
}

.message.info {
  background-color: #e3f2fd;
  color: #1565c0;
}
</style>
