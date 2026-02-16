<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { presets, type PomodoroPreset } from '@/types/pomodoro'

type Phase = 'select' | 'study' | 'study-done' | 'break' | 'break-done'

const phase = ref<Phase>('select')
const activePreset = ref<PomodoroPreset | null>(null)
const totalSeconds = ref(0)
let intervalId: number | null = null

const display = computed(() => {
  const mins = Math.floor(totalSeconds.value / 60)
  const secs = totalSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const phaseLabel = computed(() => {
  if (phase.value === 'study') return 'Study Time'
  if (phase.value === 'break') return 'Break Time'
  return ''
})

function selectPreset(preset: PomodoroPreset) {
  activePreset.value = preset
  totalSeconds.value = preset.studyMinutes * 60
  phase.value = 'study'
  startCountdown()
}

function startCountdown() {
  clearTimer()
  intervalId = window.setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      clearTimer()
      if (phase.value === 'study') {
        phase.value = 'study-done'
      } else if (phase.value === 'break') {
        phase.value = 'break-done'
      }
    }
  }, 1000)
}

function startBreak() {
  if (!activePreset.value) return
  totalSeconds.value = activePreset.value.breakMinutes * 60
  phase.value = 'break'
  startCountdown()
}

function backToSelect() {
  clearTimer()
  phase.value = 'select'
  activePreset.value = null
  totalSeconds.value = 0
}

function clearTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onUnmounted(clearTimer)
</script>

<template>
  <div class="timer pink-bg">
    <h1 class="title pink-text">sabibi timer</h1>

    <!-- Preset selection -->
    <template v-if="phase === 'select'">
      <div class="presets">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="btn pink-element"
          @click="selectPreset(preset)"
        >
          {{ preset.label }}
          <span class="preset-detail">{{ preset.studyMinutes }}/{{ preset.breakMinutes }}</span>
        </button>
      </div>
    </template>

    <!-- Active countdown (study or break) -->
    <template v-if="phase === 'study' || phase === 'break'">
      <div class="phase-label pink-text">{{ phaseLabel }}</div>
      <div class="display pink-text">{{ display }}</div>
    </template>

    <!-- Study finished — waiting for user to start break -->
    <template v-if="phase === 'study-done'">
      <div class="phase-label pink-text">Study Complete!</div>
      <button class="btn pink-highlight" @click="startBreak">Start Break</button>
    </template>

    <!-- Break finished -->
    <template v-if="phase === 'break-done'">
      <div class="phase-label pink-text">Break Over!</div>
      <button class="btn pink-element" @click="backToSelect">Done</button>
    </template>
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

.phase-label {
  font-size: 1rem;
  letter-spacing: 0.1em;
}

.display {
  font-size: 5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.presets {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preset-detail {
  opacity: 0.7;
  font-size: 0.8em;
  margin-left: 0.4rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: filter 0.2s;
  font-family: inherit;

  &:hover {
    filter: brightness(0.9);
  }
}
</style>
