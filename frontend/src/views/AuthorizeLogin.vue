<template>
  <div class="auth-container">
    <div class="card">
      <div v-if="state === 'verifying'" class="status">
        <div class="loading-spinner"></div>
        <p>正在登入...</p>
      </div>

      <div v-else-if="state === 'success'" class="success-box">
        <div class="icon">✅</div>
        <h3>登入成功</h3>
        <p>正在進入系統...</p>
      </div>

      <div v-else class="error-box">
        <div class="icon">❌</div>
        <h3>錯誤</h3>
        <p>{{ errorMessage }}</p>
        <button @click="router.push('/')" class="nano-btn">前往登入頁</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'

const route = useRoute()
const router = useRouter()
const state = ref<'verifying' | 'success' | 'error'>('verifying')
const errorMessage = ref('')

onMounted(async () => {
    // 1. Check existing session
    let token = localStorage.getItem('session')
    
    // 2. If no session, try Auto-Login by Device UUID
    if (!token) {
        const uuid = localStorage.getItem('device_uuid')
        if (uuid) {
            try {
                const res = await api.post<any>('login_by_device', { uuid })
                if (res) {
                    localStorage.setItem('session', res.token)
                    localStorage.setItem('role', res.user.role)
                    token = res.token
                }
            } catch (e) {
                console.log('Auto login failed', e)
            }
        }
    }

    // 3. Redirect
    if (token) {
        state.value = 'success'
        setTimeout(() => {
            router.push('/checkin')
        }, 1500)
    } else {
        alert('請先登入您的帳號 (或綁定此裝置以啟用快速登入)')
        router.push('/')
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

h2 {
    margin-bottom: 2rem;
    color: #333;
}

.warning-text {
    color: #666;
    margin-bottom: 0.5rem;
}

.device-text {
    font-family: monospace;
    background: #eee;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 2rem;
    display: inline-block;
}

.actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nano-btn {
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    font-weight: 600;
}

.nano-btn.success {
    background: #4CAF50;
    color: white;
}

.nano-btn.danger {
    background: #f44336;
    color: white;
}

.icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.error-box {
    color: #d32f2f;
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
