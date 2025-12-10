<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api'

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
    
    // Check if result returned token (depends on backend structure)
    if (result && result.token) {
        localStorage.setItem('session', result.token)
        localStorage.setItem('role', result.user.role)
        
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
</script>

<template>
  <div class="login-page">
    <div class="glass-panel login-card">
      <h1>派外人員管理</h1>
      <p class="subtitle">請登入以繼續</p>
      
      <div v-if="errorMessage" class="error-msg">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
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
</style>
