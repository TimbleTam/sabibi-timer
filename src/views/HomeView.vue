<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function launchTimer() {
  const width = 430;
  const height = 430;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;

  window.open(
    "/sabibi-timer/#/timer",
    "sabibi-timer",
    `width=${width},height=${height},left=${left},top=${top},resizable=no,menubar=no,toolbar=no,location=no,status=no`,
  );
}
</script>

<template>
  <div class="home">
    <button class="launch-btn" @click="launchTimer">Start Timer</button>
    <button class="stats-btn" @click="router.push('/stats')">View Stats</button>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 0.75rem;
}

.launch-btn {
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #6d28d9;
  }
}

.stats-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.9rem;
  border: 2px solid #7c3aed;
  border-radius: 8px;
  background: transparent;
  color: #7c3aed;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #7c3aed;
    color: #fff;
  }
}
</style>
