<template>
  <div class="mobile-layout">
    <div class="glass-panel status-card">
      <h2>你好, Ryan</h2>
      <p>目前狀態: <span class="status-out">打卡中...</span></p>
    </div>

    <div class="action-grid">
      <button class="nano-btn action-btn">上班</button>
      <button class="nano-btn action-btn secondary">下班</button>
      <button class="nano-btn action-btn warning">外出</button>
      <button class="nano-btn action-btn info">公出</button>
    </div>
  </div>
</template>

<style scoped>
.mobile-layout {
  padding: 1.5rem;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.status-card {
  padding: 2rem;
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-btn {
  padding: 2rem 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.warning {
  background: linear-gradient(135deg, var(--color-warning), #d97706);
}

.action-btn.info {
  background: linear-gradient(135deg, var(--color-accent), #0891b2);
}
</style>
