<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { presets, type PomodoroPreset } from '@/types/pomodoro'
import { saveCompletion } from '@/types/stats'
import alarmSrc from '@/assets/audio/alarm.mp3'
import badge1 from '@/assets/img/badge1.gif'
import badge2 from '@/assets/img/badge2.gif'
import badge3 from '@/assets/img/badge3.gif'

type Phase =
  | 'select'
  | 'study-ready'
  | 'study'
  | 'study-done'
  | 'break-ready'
  | 'break'
  | 'break-done'

const phase = ref<Phase>('select')
const activePreset = ref<PomodoroPreset | null>(null)
const totalSeconds = ref(0)
let intervalId: number | null = null

const alarm = new Audio(alarmSrc)
alarm.loop = true

const display = computed(() => {
  const mins = Math.floor(totalSeconds.value / 60)
  const secs = totalSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'study-ready':
    case 'study':
      return 'Study Time'
    case 'study-done':
      return 'Study Complete!'
    case 'break-ready':
    case 'break':
      return 'Break Time'
    case 'break-done':
      return 'Break Over!'
    default:
      return ''
  }
})

const isCountingDown = computed(() => phase.value === 'study' || phase.value === 'break')
const isAlarming = computed(() => phase.value === 'study-done' || phase.value === 'break-done')
const isReady = computed(() => phase.value === 'study-ready' || phase.value === 'break-ready')

function selectPreset(preset: PomodoroPreset) {
  activePreset.value = preset
  totalSeconds.value = preset.studyMinutes * 60
  phase.value = 'study-ready'
}

function startTimer() {
  clearInterval_(intervalId)
  intervalId = window.setInterval(() => {
    if (totalSeconds.value > 0) {
      totalSeconds.value--
    } else {
      clearInterval_(intervalId)
      intervalId = null
      if (phase.value === 'study') {
        saveCompletion(activePreset.value!.studyMinutes)
        phase.value = 'study-done'
      } else if (phase.value === 'break') {
        phase.value = 'break-done'
      }
      alarm.currentTime = 0
      alarm.play()
    }
  }, 1000)

  if (phase.value === 'study-ready') {
    phase.value = 'study'
  } else if (phase.value === 'break-ready') {
    phase.value = 'break'
  }
}

function stopTimer() {
  alarm.pause()
  alarm.currentTime = 0

  if (isAlarming.value) {
    // Alarm was playing — transition to next phase
    if (phase.value === 'study-done' && activePreset.value) {
      totalSeconds.value = activePreset.value.breakMinutes * 60
      phase.value = 'break-ready'
    } else if (activePreset.value) {
      // break-done — loop back to study
      totalSeconds.value = activePreset.value.studyMinutes * 60
      phase.value = 'study-ready'
    }
  } else if (isCountingDown.value) {
    // User stopped a running timer — transition forward
    clearInterval_(intervalId)
    intervalId = null
    if (phase.value === 'study' && activePreset.value) {
      totalSeconds.value = activePreset.value.breakMinutes * 60
      phase.value = 'break-ready'
    } else if (activePreset.value) {
      totalSeconds.value = activePreset.value.studyMinutes * 60
      phase.value = 'study-ready'
    }
  }
}

function cancel() {
  clearInterval_(intervalId)
  intervalId = null
  alarm.pause()
  alarm.currentTime = 0
  phase.value = 'select'
  activePreset.value = null
  totalSeconds.value = 0
}

function clearInterval_(id: number | null) {
  if (id !== null) clearInterval(id)
}

onUnmounted(() => {
  clearInterval_(intervalId)
  alarm.pause()
})
</script>

<template>
  <div class="timer pink-bg">
    <template v-if="phase === 'study'">
      <img :src="badge1" class="corner-gif top-left" alt="" />
      <img :src="badge2" class="corner-gif top-right" alt="" />
      <img :src="badge3" class="corner-gif bottom-right" alt="" />
    </template>

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

    <!-- Timer display (all phases except select) -->
    <template v-if="phase !== 'select'">
      <div class="phase-label pink-text">{{ phaseLabel }}</div>
      <div class="display pink-text">{{ display }}</div>

      <button v-if="isReady" class="btn pink-element" @click="startTimer">Start</button>
      <button v-if="isCountingDown || isAlarming" class="btn pink-highlight" @click="stopTimer">Stop</button>
      <button class="btn-cancel pink-text" @click="cancel">cancel</button>
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
  position: relative;
  overflow: hidden;
}

.corner-gif {
  position: absolute;
  width: 80px;
  pointer-events: none;
  opacity: 0.85;

  &.top-left {
    top: 12px;
    left: 12px;
  }

  &.top-right {
    top: 12px;
    right: 12px;
  }

  &.bottom-right {
    bottom: 12px;
    right: 12px;
  }
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

.btn-cancel {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}
</style>
