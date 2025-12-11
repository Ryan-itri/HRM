<template>
  <div class="auth-container">
    <div class="card">
      <div v-if="state === 'verifying'" class="status">
        <div class="loading-spinner"></div>
        <p>正在確認裝置權限...</p>
      </div>

      <div v-else-if="state === 'success'" class="success-box">
        <div class="icon">✅</div>
        <h3>登入成功</h3>
        <p>正在進入系統...</p>
      </div>

      <div v-else class="error-box">
        <div class="icon">🚫</div>
        <h3>禁止存取</h3>
        <p>此裝置尚未被授權存取系統。</p>
        
        <div class="device-info">
            <p class="label">請將此代碼提供給管理員：</p>
            <div class="uuid-box">{{ currentUuid }}</div>
        </div>
        
        <div class="help-text">
            綁定完成後，請重新掃描 QR Code。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()
const state = ref<'verifying' | 'success' | 'error'>('verifying')
const currentUuid = ref('')

onMounted(async () => {
    // 1. Ensure Device UUID exists
    let uuid = localStorage.getItem('device_uuid')
    if (!uuid) {
        uuid = crypto.randomUUID()
        localStorage.setItem('device_uuid', uuid)
    }
    currentUuid.value = uuid

    // 2. Check Existing Session
    let token = localStorage.getItem('session')
    
    // 3. If no session, try Auto-Login by Device UUID
    if (!token) {
        try {
            const res = await api.post<any>('login_by_device', { uuid })
            if (res && res.token) {
                localStorage.setItem('session', res.token)
                localStorage.setItem('role', res.user.role)
                token = res.token
            }
        } catch (e) {
            console.log('Auto login failed', e)
        }
    }

    // 4. Final Decision
    if (token) {
        state.value = 'success'
        setTimeout(() => {
            router.push('/checkin')
        }, 1500)
    } else {
        // STRICT MODE: Deny Access
        state.value = 'error'
        // Do NOT redirect to login page
    }
})
</script>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f0f2f5;
    padding: 1rem;
}

.card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h3 {
    margin: 1rem 0;
    color: #333;
}

.icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.error-box {
    color: #333;
}

.error-box .icon {
    color: #e53935;
}

.device-info {
    margin: 2rem 0;
    background: #fff3e0;
    padding: 1rem;
    border-radius: 8px;
    border: 1px dashed #ffa726;
}

.label {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
}

.uuid-box {
    font-family: 'Roboto Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    word-break: break-all;
    color: #ef6c00;
    user-select: all;
}

.help-text {
    font-size: 0.9rem;
    color: #888;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0,0,0,0.1);
    border-radius: 50%;
    border-top-color: #4CAF50;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
