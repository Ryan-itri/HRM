<template>
  <div class="mobile-layout">
    <!-- Main Check-in Screen -->
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
      <button class="nano-btn action-btn success" @click="handleCheckInClick('上班')">上班</button>
      <button class="nano-btn action-btn secondary" @click="handleCheckInClick('下班')">下班</button>
      <button class="nano-btn action-btn warning" @click="handleCheckInClick('外出')">外出</button>
      <button class="nano-btn action-btn info" @click="handleCheckInClick('公出')">公出</button>
    </div>

    <div class="nav-actions">
        <button class="nano-btn outline" @click="router.push('/kiosk')">
            查看全部人員出勤狀況
        </button>
        <button class="nano-btn text-only" @click="handleLogout">
            登出
        </button>
    </div>

    <!-- Extra Info Modal -->
    <div v-if="showModal" class="modal-overlay">
        <div class="glass-panel modal-card">
            <h3>{{ pendingStatus }}資訊</h3>
            
            <div class="form-group">
                <label>前往地點/事由 *</label>
                <input type="text" v-model="extraLocation" class="glass-input" placeholder="請輸入地點或事由" />
            </div>

            <div v-if="pendingStatus === '外出'" class="form-group">
                <label>預計時間 (起~迄) *</label>
                <div class="time-range">
                    <input type="time" v-model="extraStartTime" class="glass-input" />
                    <span>~</span>
                    <input type="time" v-model="extraEndTime" class="glass-input" />
                </div>
            </div>

            <div class="modal-actions">
                <button class="nano-btn secondary" @click="closeModal">取消</button>
                <button class="nano-btn" @click="confirmCheckIn">確認打卡</button>
            </div>
        </div>
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

// Modal State
const showModal = ref(false)
const pendingStatus = ref('')
// Extra Inputs
const extraLocation = ref('')
const extraStartTime = ref('')
const extraEndTime = ref('')

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
        const role = localStorage.getItem('role')
        userName.value = role ? `(${role})` : '使用者'
    }

    // 2. Start Clock
    updateClock()
    clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
    if (clockInterval) clearInterval(clockInterval)
})

// Step 1: Click Button
const handleCheckInClick = (status: string) => {
    if (status === '外出' || status === '公出') {
        // Open Modal
        pendingStatus.value = status
        extraLocation.value = ''
        
        // Default Times
        const now = new Date()
        const nextHour = new Date(now.getTime() + 60*60*1000)
        extraStartTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        extraEndTime.value = nextHour.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        
        showModal.value = true
    } else {
        // Direct Submit
        submitCheckIn(status)
    }
}

// Step 2: Confirm Modal
const confirmCheckIn = () => {
    // Validation
    if (!extraLocation.value.trim()) {
        alert('請輸入地點/事由')
        return
    }
    
    if (pendingStatus.value === '外出') {
        if (!extraStartTime.value || !extraEndTime.value) {
            alert('請輸入完整的時間區間')
            return
        }
    }

    submitCheckIn(pendingStatus.value)
}

const closeModal = () => {
    showModal.value = false
    pendingStatus.value = ''
}

// Step 3: API Call
const submitCheckIn = async (status: string) => {
    showModal.value = false // Close modal first
    isLoading.value = true
    try {
        let note = ''
        let location = ''
        
        if (status === '外出' || status === '公出') {
            location = extraLocation.value
            if (status === '外出') {
                note = `${extraStartTime.value}~${extraEndTime.value}`
            }
        }
        
        const token = localStorage.getItem('session')
        
        await api.post('check_in_out', {
            status: status,
            location: location,
            note: note,
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

/* ... Existing Styles ... */
.status-card {
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.clock-display { margin-bottom: 1.5rem; }
.clock-display .time { font-size: 3rem; font-weight: 700; line-height: 1; color: var(--color-primary); }
.clock-display .date { color: var(--color-text-muted); margin-top: 0.5rem; }
.status-text { font-size: 1.1rem; margin-top: 0.5rem; }
.status-badge { font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 4px; background: #eee; }
.status-in { color: var(--color-success); background: rgba(34, 197, 94, 0.1); }
.status-out { color: var(--color-text-muted); background: #eee; }
.status-other { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); }

/* Action Grid */
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
.action-btn:active { transform: scale(0.98); }
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

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
}

.modal-card {
    width: 100%;
    max-width: 320px;
    background: white;
    padding: 1.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-card h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    text-align: center;
}

.form-group {
    margin-bottom: 1rem;
    text-align: left;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.time-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
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
@keyframes spin { to { transform: rotate(360deg); } }
</style>
