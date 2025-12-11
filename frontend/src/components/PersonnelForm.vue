<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  isEdit: boolean
  initialData?: any
}>()

const emit = defineEmits(['close', 'save'])

const form = ref({
  Name: '',
  Account: '',
  Password: '',
  Role: 'staff',
  Department: '',
  Title: '',
  Email: '',
  UUID: '',
  IsActive: true
})

// Reset or Load data
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.isEdit && props.initialData) {
      form.value = { ...props.initialData, Password: '' } // Don't show password
    } else {
      // Reset
      form.value = {
        Name: '',
        Account: '',
        Password: '',
        Role: 'staff',
        Department: '',
        Title: '',
        Email: '',
        UUID: '',
        IsActive: true
      }
    }
  }
})

const isFormValid = computed(() => {
    return form.value.Name && form.value.Account && form.value.Role
})

const handleSubmit = () => {
    emit('save', { isNew: !props.isEdit, data: form.value })
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="glass-panel modal-content">
      <header>
        <h3>{{ isEdit ? '編輯人員' : '新增人員' }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </header>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
            <div class="form-group">
                <label>姓名 Name</label>
                <input v-model="form.Name" class="glass-input" required />
            </div>
            
            <div class="form-group">
                <label>帳號 Account</label>
                <input v-model="form.Account" class="glass-input" :disabled="isEdit" required />
            </div>

            <div class="form-group">
                <label>密碼 Password</label>
                <input v-model="form.Password" type="password" class="glass-input" :placeholder="isEdit ? '空白表示不修改' : '預設 123456'" />
            </div>

            <div class="form-group">
                <label>角色 Role</label>
                <select v-model="form.Role" class="glass-input">
                    <option value="staff">一般員工 (Staff)</option>
                    <option value="supervisor">主管 (Supervisor)</option>
                    <option value="admin">管理員 (Admin)</option>
                </select>
            </div>

            <div class="form-group">
                <label>部門 Department</label>
                <input v-model="form.Department" class="glass-input" />
            </div>

            <div class="form-group">
                <label>職稱 Title</label>
                <input v-model="form.Title" class="glass-input" />
            </div>
             <div class="form-group">
                <label>Email</label>
                <input v-model="form.Email" type="email" class="glass-input" />
            </div>
             <div class="form-group full-width">
                <label>裝置代碼 Device UUID (選填)</label>
                <input v-model="form.UUID" class="glass-input" placeholder="用於綁定裝置" />
            </div>
        </div>

        <div class="modal-actions">
            <button type="button" class="nano-btn secondary" @click="$emit('close')">取消</button>
            <button type="submit" class="nano-btn" :disabled="!isFormValid">儲存</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  animation: slideUp 0.3s ease;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

select.glass-input {
    background-color: rgba(30, 30, 30, 0.9); /* Opaque background for options */
    color: white;
}

select.glass-input option {
    background-color: #222;
    color: white;
}

.full-width {
    grid-column: 1 / -1;
}

.modal-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
