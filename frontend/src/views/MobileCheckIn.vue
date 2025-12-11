<template>
  <div class="mobile-layout">
    <div class="glass-panel status-card">
      <div class="clock-display">
          <div class="time">{{ currentTime }}</div>
          <div class="date">{{ currentDate }}</div>
      </div>
      
      <h2>你好, {{ userName }}</h2>
      <p class="status-text">目前狀態: <span class="status-badge" :class="currentStatusClass">{{ currentStatus }}</span></p>

      <div v-if="isLoading" class="loading-overlay">
          <div class="spinner"></div>
          <p>處理中...</p>
      </div>
    </div>

    <div class="action-grid">
      <button class="nano-btn action-btn success" @click="handleCheckIn('上班')">上班</button>
      <button class="nano-btn action-btn secondary" @click="handleCheckIn('下班')">下班</button>
      <button class="nano-btn action-btn warning" @click="handleCheckIn('外出')">外出</button>
      <button class="nano-btn action-btn info" @click="handleCheckIn('公出')">公出</button>
    </div>

    <div class="nav-actions">
        <button class="nano-btn outline" @click="router.push('/kiosk')">
            查看全部人員出勤狀況
        </button>
        <button class="nano-btn text-only" @click="handleLogout">
            登出
        </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()
const userName = ref('User')
const currentStatus = ref('未打卡')
const isLoading = ref(false)

// Clock
const currentTime = ref('')
const currentDate = ref('')
let clockInterval: any = null

const updateClock = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
    currentDate.value = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

const currentStatusClass = computed(() => {
    if (currentStatus.value === '上班') return 'status-in'
    if (currentStatus.value === '下班') return 'status-out'
    return 'status-other'
})

onMounted(() => {
    // 1. Get Name (Robust Check)
    const storedName = localStorage.getItem('user_name')
    if (storedName && storedName !== 'undefined' && storedName !== 'null') {
        userName.value = storedName
    } else {
        // Fallback to role or account if name missing
        const role = localStorage.getItem('role')
        userName.value = role ? `(${role})` : '使用者'
    }

    // 2. Start Clock
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
    
    // 3. TODO: Get current status from backend if supported?
    // For now, default is unknown or locally cached last status? 
    // SRS didn't specify persistent status check on load, but we can default to '未打卡'
})

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval)
})

const handleCheckIn = async (status: string) => {
    isLoading.value = true
    try {
        // Location (Optional per SRS V4, but good to have)
        let location = ''
        // If needed: navigator.geolocation.getCurrentPosition(...)
        
        const token = localStorage.getItem('session')
        
        await api.post('check_in_out', {
            status: status,
            location: location,
            note: '',
            uuid: localStorage.getItem('device_uuid') || ''
        }, token || '')

        currentStatus.value = status
        alert(`打卡成功：${status}`)
    } catch (e: any) {
        alert('打卡失敗: ' + e.message)
    } finally {
        isLoading.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('session')
    localStorage.removeItem('role')
    localStorage.removeItem('user_name')
    router.push('/')
}
</script>

<style scoped>
.mobile-layout {
  padding: 1.5rem;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
}

.status-card {
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.clock-display {
    margin-bottom: 1.5rem;
}

.clock-display .time {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-primary);
}

.clock-display .date {
    color: var(--color-text-muted);
    margin-top: 0.5rem;
}

.status-text {
    font-size: 1.1rem;
    margin-top: 0.5rem;
}

.status-badge {
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    background: #eee;
}

.status-in { color: var(--color-success); background: rgba(34, 197, 94, 0.1); }
.status-out { color: var(--color-text-muted); background: #eee; }
.status-other { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); }

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  padding: 2rem 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.1s;
}

.action-btn:active {
    transform: scale(0.98);
}

.action-btn.success { background: var(--color-success); color: white; }
.action-btn.secondary { background: var(--color-secondary); color: white; }
.action-btn.warning { background: var(--color-warning); color: white; }
.action-btn.info { background: var(--color-accent); color: white; }

.nav-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.nano-btn.outline {
    background: transparent;
    border: 2px solid var(--color-primary);
    color: var(--color-primary);
    padding: 1rem;
    width: 100%;
}

.nano-btn.text-only {
    background: transparent;
    border: none;
    color: #666;
    margin-top: 1rem;
}

.loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #ccc;
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
