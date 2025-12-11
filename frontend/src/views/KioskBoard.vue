<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

const router = useRouter()
const currentTime = ref(new Date().toLocaleTimeString())
const currentDate = ref(new Date().toLocaleDateString())
const users = ref<any[]>([])
const errorMsg = ref('')

let timer: any
let clockTimer: any

const fetchBoardData = async () => {
    try {
        errorMsg.value = ''
        const res = await api.post<any[]>('get_status_board')
        if (Array.isArray(res)) {
            users.value = res
        } else {
            errorMsg.value = 'Data is not array'
        }
    } catch (e: any) {
        console.error('Failed to fetch board data', e)
        errorMsg.value = e.message || 'Fetch Error'
    }
}

const goToCheckIn = () => {
    router.push('/checkin')
}

onMounted(() => {
// ... existing onMounted ...
  // Clock
  clockTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('zh-TW', { hour12: false })
    currentDate.value = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  }, 1000)
  
  // Data Loop (15s)
  fetchBoardData()
  timer = setInterval(fetchBoardData, 15000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (clockTimer) clearInterval(clockTimer)
})

const getStatusColor = (status: string) => {
  if (status === '上班') return 'var(--color-success)'
  if (status === '外出') return 'var(--color-warning)'
  if (status === '公出') return 'var(--color-accent)' // Added '公出'
  if (status === '下班') return 'var(--color-text-muted)'
  return 'transparent' // Default white/glass
}
</script>

<template>
  <div class="kiosk-page">
    <header class="glass-panel header">
      <div class="logo">
        <h2>南區研發中心<br>人員出勤看板</h2>
      </div>
      <div class="clock">
        <div class="time">{{ currentTime }}</div>
        <div class="date">{{ currentDate }}</div>
      </div>
    </header>

    <main class="grid-container">
      <div 
        v-for="(user, index) in users" 
        :key="index" 
        class="glass-panel user-card"
        :style="{ borderLeft: `4px solid ${getStatusColor(user.status)}` }"
      >
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          <span class="location" v-if="user.location">📍 {{ user.location }}</span>
        </div>
        <div class="status-badge" :style="{ color: getStatusColor(user.status) }">
          {{ user.status }}
        </div>
      </div>
    </main>

    <div class="glass-panel qr-sidebar" @click="goToCheckIn">
      <h3>掃描打卡</h3>
      <div class="qr-placeholder">
        <!-- Placeholder for QR Code -->
        <div class="qr-mock">QR</div>
      </div>
      <p class="refresh-hint">每 15 秒自動刷新</p>
      
      <button class="nano-btn primary mobile-only-btn" @click.stop="goToCheckIn">
          前往個人打卡頁面
      </button>
    </div>
  </div>
</template>

<style scoped>
.kiosk-page {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr 300px;
  height: 100vh;
  gap: 1.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

.header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.clock {
  text-align: right;
}
.clock .time { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
.clock .date { font-size: 0.9rem; color: var(--color-text-muted); }

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.user-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 120px;
}

.user-info h3 { margin: 0; font-size: 1.25rem; }
.location { font-size: 0.85rem; color: var(--color-text-muted); display: block; margin-top: 0.5rem; }

.status-badge {
  font-weight: 700;
  align-self: flex-end;
  font-size: 1.1rem;
}

.qr-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  cursor: pointer; /* Require interaction hint */
  transition: transform 0.2s;
}

.qr-sidebar:active {
    transform: scale(0.98);
}

.mobile-only-btn {
    display: none;
    margin-top: 1rem;
}

.qr-mock {
  width: 180px;
  height: 180px;
  background: white;
  margin: 1.5rem 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-weight: bold;
}

@media (max-width: 768px) {
    .kiosk-page {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
        height: auto;
        min-height: 100vh;
        gap: 1rem;
        padding: 1rem;
    }

    .qr-sidebar {
        grid-row: 2;
        padding: 1rem;
        flex-direction: row;
        justify-content: space-between;
        gap: 1rem;
        text-align: left;
    }
    
    .qr-sidebar h3 {
        margin: 0;
    }
    
    .qr-placeholder {
        display: none; /* Hide QR on mobile view to save space, or make small */
    }
    
    .refresh-hint {
        display: none;
    }

    .mobile-only-btn {
        display: block; /* Show on mobile */
    }

    .grid-container {
        grid-template-columns: 1fr; /* Single column for user cards on mobile */
    }
    
    .user-card {
        height: auto;
        flex-direction: row;
        align-items: center;
    }
    
    .status-badge {
        align-self: center;
    }
}
</style>
