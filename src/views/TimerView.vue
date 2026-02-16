<script setup lang="ts">
import { ref, computed } from 'vue'

const totalSeconds = ref(25 * 60)
const isRunning = ref(false)
let intervalId: number | null = null

const minutes = computed(() => Math.floor(totalSeconds.value / 60))
const seconds = computed(() => totalSeconds.value % 60)
const display = computed(
  () => `${String(minutes.value).padStart(2, '0')}:${String(seconds.value).padStart(2, '0')}`,
)

function toggle() {
  if (isRunning.value) {
    pause()
  } else {
    start()
  }
}

function start() {
  if (totalSeconds.value <= 0) return
  isRunning.value = true
  intervalId = window.setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      pause()
    }
  }, 1000)
}

function pause() {
  isRunning.value = false
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function reset() {
  pause()
  totalSeconds.value = 25 * 60
}
</script>

<template>
  <div class="timer pink-bg">
    <h1 class="title pink-text">sabibi timer</h1>
    <div class="display pink-text">{{ display }}</div>
    <div class="controls">
      <button class="btn pink-element" @click="toggle">
        {{ isRunning ? 'Pause' : 'Start' }}
      </button>
      <button class="btn btn--reset pink-highlight" @click="reset">Reset</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1.5rem;
  user-select: none;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: lowercase;
  margin: 0;
}

.display {
  font-size: 5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.controls {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(0.9);
  }
}
</style>
