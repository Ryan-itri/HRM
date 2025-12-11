<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'
import QRCode from 'qrcode'

const router = useRouter()
const account = ref('')
const password = ref('')
const isLoading = ref(false)

const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const result = await api.post<any>('login', {
      account: account.value,
      password: password.value
    })
    
    // Check if result returned token
    if (result && result.token) {
        localStorage.setItem('session', result.token)
        localStorage.setItem('role', result.user.role)
        localStorage.setItem('user_name', result.user.name || result.user.Name || result.user.account || '使用者')
        
        if (result.user.role === 'admin') {
            router.push('/admin')
        } else {
            router.push('/checkin')
        }
    } else {
        errorMessage.value = '登入失敗：帳號或密碼錯誤'
    }
  } catch (error: any) {
    if (error.message.includes('Authentication failed')) {
        errorMessage.value = '登入失敗：帳號或密碼錯誤'
    } else {
        errorMessage.value = '系統錯誤: ' + error.message
    }
  } finally {
    isLoading.value = false
  }
}

// Kiosk Mode Logic
const isKioskMode = ref(false)
const showKioskLogin = ref(false)
const kioskName = ref('')
const qrCodeUrl = ref('')
let sessionRefreshInterval: any = null

// Clock
const currentTime = ref('')
const currentDate = ref('')
let clockInterval: any = null
const isCheckingDevice = ref(true)

const updateClock = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    currentDate.value = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

onMounted(async () => {
    // 1. Ensure Device UUID exists
    let uuid = localStorage.getItem('device_uuid')
    if (!uuid) {
        uuid = crypto.randomUUID()
        localStorage.setItem('device_uuid', uuid)
    }

    // 2. Check Kiosk Permission
    if (uuid) {
        try {
            const res = await api.post<any>('check_kiosk_permission', { uuid })
            if (res.isKiosk) {
                isKioskMode.value = true
                showKioskLogin.value = true
                kioskName.value = res.device.name
                startQRSession(uuid)
                
                // Start Clock
                updateClock()
                clockInterval = setInterval(updateClock, 1000)
            }
        } catch (e) {
            console.error('Kiosk check failed', e)
        } finally {
            isCheckingDevice.value = false
        }
    } else {
        isCheckingDevice.value = false
    }
})

onUnmounted(() => {
    if (sessionRefreshInterval) clearTimeout(sessionRefreshInterval)
    if (clockInterval) clearInterval(clockInterval)
})

const startQRSession = async (uuid: string) => {
    try {
        // Get Session ID from Backend
        const res = await api.post<any>('init_qr_session', { uuid })
        const sessionId = res.sessionId
        
        // Generate QR Code containing Authorize Link
        const baseUrl = window.location.href.split('#')[0]
        const authUrl = `${baseUrl}#/authorize?session=${sessionId}`
        qrCodeUrl.value = await QRCode.toDataURL(authUrl)
        
        // Refresh session every 60s
        sessionRefreshInterval = setTimeout(() => startQRSession(uuid), 60000)
    } catch (e) {
        console.error('QR Session Init Failed', e)
        errorMessage.value = '無法產生 QR Code，請檢查網路連線'
    }
}

const toggleLoginMode = () => {
    showKioskLogin.value = !showKioskLogin.value
}
</script>

<template>
  <div class="login-page">
    <div class="glass-panel login-card">
      <h1>南區研發中心<br>人員出勤看板</h1>
      
      <div v-if="errorMessage" class="error-msg">
        {{ errorMessage }}
      </div>

      <div v-if="isCheckingDevice" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在確認裝置身分...</p>
      </div>

      <div v-else-if="showKioskLogin" class="kiosk-mode">
          <div class="clock-display">
              <div class="time">{{ currentTime }}</div>
              <div class="date">{{ currentDate }}</div>
          </div>
          <p>請掃描 QR Code 進行打卡/登入</p>
          <div class="qr-container">
              <img :src="qrCodeUrl" class="qr-img" v-if="qrCodeUrl"/>
              <div v-else class="loading-qr">載入中...</div>
          </div>
          <h3>{{ kioskName }}</h3>
          <button class="nano-btn secondary" @click="toggleLoginMode">切換為一般登入</button>
      </div>

      <form v-else @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input type="text" v-model="account" placeholder="帳號" class="glass-input" required />
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="密碼" class="glass-input" required />
        </div>
        
        <button type="submit" class="nano-btn" :disabled="isLoading">
          <span v-if="!isLoading">登入</span>
          <span v-else>驗證中...</span>
        </button>

        <button v-if="isKioskMode" type="button" class="nano-btn text-only" @click="toggleLoginMode">
            返回 QR Code 登入
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.error-msg {
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid var(--color-danger);
  color: #fca5a5;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2rem;
  text-align: center;
  width: 100%;
}

.subtitle {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-weight: 300;
}

.form-group {
  margin-bottom: 1.5rem;
}

.nano-btn {
  width: 100%;
  margin-top: 1rem;
}

.kiosk-mode {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qr-container {
    background: white;
    padding: 1rem;
    margin: 1.5rem 0;
    border-radius: 12px;
}

.qr-img {
    width: 200px;
    height: 200px;
    display: block;
}

.loading-qr {
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
}

.nano-btn.text-only {
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: pointer;
}

.loading-state {
    padding: 2rem;
    color: var(--color-text-muted);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.clock-display {
    margin-bottom: 2rem;
    color: var(--color-text-primary);
}

.clock-display .time {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-primary);
}

.clock-display .date {
    font-size: 1.2rem;
    color: var(--color-text-muted);
    margin-top: 0.5rem;
}
</style>
