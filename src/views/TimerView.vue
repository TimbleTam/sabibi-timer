<script setup lang="ts">
import { ref, computed, watch, watchEffect, onUnmounted } from 'vue'
import { presets, type PomodoroPreset } from '@/types/pomodoro'
import { saveCompletion } from '@/types/stats'
import alarmSrc from '@/assets/audio/alarm.mp3'
import studyLines from '@/assets/data/study-lines.json'
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

const studyLine = ref('')
const studyLineVisible = ref(false)
const studyLineKey = ref(0)
let lineTimeoutId: number | null = null

function pickRandomLine() {
  let next = studyLines[Math.floor(Math.random() * studyLines.length)]
  while (next === studyLine.value && studyLines.length > 1) {
    next = studyLines[Math.floor(Math.random() * studyLines.length)]
  }
  return next
}

function cycleStudyLine() {
  studyLine.value = pickRandomLine()
  studyLineKey.value++
  studyLineVisible.value = true

  lineTimeoutId = window.setTimeout(() => {
    studyLineVisible.value = false

    lineTimeoutId = window.setTimeout(() => {
      if (phase.value === 'study') cycleStudyLine()
    }, 600)
  }, 12000)
}

function stopStudyLines() {
  if (lineTimeoutId !== null) clearTimeout(lineTimeoutId)
  lineTimeoutId = null
  studyLineVisible.value = false
  studyLine.value = ''
}

watch(
  () => phase.value,
  (newPhase) => {
    if (newPhase === 'study') {
      cycleStudyLine()
    } else {
      stopStudyLines()
    }
  },
)

watchEffect(() => {
  const base = 'sabibi timer'
  if (!phaseLabel.value) {
    document.title = base
  } else if (phase.value === 'study' && studyLine.value) {
    document.title = `${base} — ${phaseLabel.value} — ${studyLine.value}`
  } else {
    document.title = `${base} — ${phaseLabel.value}`
  }
})

onUnmounted(() => {
  clearInterval_(intervalId)
  stopStudyLines()
  alarm.pause()
})
</script>

<template>
  <div class="timer pink-bg">
    <template v-if="phase === 'break'">
      <img :src="badge1" class="corner-gif top-left" alt="" />
      <img :src="badge2" class="corner-gif top-right" alt="" />
      <img :src="badge3" class="corner-gif bottom-right" alt="" />
    </template>

    <h1 v-if="phase !== 'study'" class="title pink-text">sabibi timer</h1>

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
      <div class="display pink-text" :class="{ 'display--active': isCountingDown }">{{ display }}</div>

      <button v-if="isReady" class="btn pink-element" @click="startTimer">Start</button>
      <button v-if="isCountingDown || isAlarming" class="btn pink-highlight" @click="stopTimer">Stop</button>
      <button class="btn-cancel pink-text" @click="cancel">cancel</button>
    </template>

    <div
      v-if="phase === 'study' && studyLine"
      :key="studyLineKey"
      class="study-line pink-text"
      :class="{ 'study-line--out': !studyLineVisible }"
    >
      {{ studyLine }}
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
  position: relative;
  overflow: hidden;
}

.corner-gif {
  position: absolute;
  width: 80px;
  pointer-events: none;
  animation: fade-in 0.6s ease-out both;

  &.top-left {
    top: 12px;
    left: 12px;
    animation: fade-in 0.6s ease-out both, float-y 3s ease-in-out 0.6s infinite;
  }

  &.top-right {
    top: 12px;
    right: 12px;
    animation: fade-in 0.6s ease-out 0.15s both, float-x 3.5s ease-in-out 0.75s infinite;
  }

  &.bottom-right {
    bottom: 12px;
    right: 12px;
    animation: fade-in 0.6s ease-out 0.3s both, float-y 4s ease-in-out 0.9s infinite;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    scale: 0.5;
  }
  to {
    opacity: 0.85;
    scale: 1;
  }
}

@keyframes float-y {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}

@keyframes float-x {
  0%, 100% { translate: 0 0; }
  50% { translate: -6px -4px; }
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

  &--active {
    animation: pulse 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
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

.study-line {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  opacity: 0.8;
  animation: slide-up 0.5s ease-out both;

  &--out {
    animation: slide-down 0.5s ease-in both;
  }
}

@keyframes slide-up {
  from {
    translate: 0 30px;
    opacity: 0;
  }
  to {
    translate: 0 0;
    opacity: 0.8;
  }
}

@keyframes slide-down {
  from {
    translate: 0 0;
    opacity: 0.8;
  }
  to {
    translate: 0 30px;
    opacity: 0;
  }
}
</style>
