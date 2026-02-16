<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { loadCompletions, aggregateByDay } from '@/types/stats'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const router = useRouter()

const days = computed(() => aggregateByDay(loadCompletions()))

const dayLabels = computed(() =>
  days.value.map((d) => {
    const date = new Date(d.date + 'T00:00:00')
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${weekday} ${date.getDate()}`
  }),
)

const hasData = computed(() => days.value.some((d) => d.totalMinutes > 0))

const chartData = computed(() => ({
  labels: dayLabels.value,
  datasets: [
    {
      data: days.value.map((d) => d.totalMinutes),
      backgroundColor: '#f48fb1',
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number | null } }) => `${ctx.parsed.y ?? 0} min`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#d1618f',
        font: { family: 'Pacifico' },
      },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#d1618f',
        font: { family: 'Pacifico' },
        stepSize: 25,
      },
      grid: { color: 'rgba(244,143,177,0.2)' },
    },
  },
} as const

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="stats pink-bg">
    <h1 class="title pink-text">study stats</h1>

    <div v-if="hasData" class="chart-wrap">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <p v-else class="empty pink-text">
      no sessions yet — complete a study timer to see your stats!
    </p>

    <button class="btn-back pink-text" @click="goBack">back</button>
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  gap: 1.5rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: lowercase;
}

.chart-wrap {
  width: 100%;
  max-width: 700px;
  height: 350px;
}

.empty {
  font-size: 0.95rem;
  opacity: 0.7;
  text-align: center;
  max-width: 300px;
}

.btn-back {
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
