# sabibi timer

A cute pomodoro timer that opens in a small popup window. Built with Vue 3, TypeScript, and Vite.

## Features

- **Pomodoro presets** — Light (25/5), Standard (50/10), and Deep Focus (80/20)
- **Popup window** — timer launches in a focused 430x430 window, keeping it out of your main browser tabs
- **Study/break cycle** — automatically transitions between study and break phases with an alarm
- **Study stats** — completed sessions are saved to localStorage and visualized on a 14-day bar chart (Chart.js)
- **Animated GIFs** — decorative corner badges appear during study sessions with float animations

## Tech Stack

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vue Router (hash history)
- Chart.js + vue-chartjs (lazy-loaded)
- Sass
- Vite
- Pacifico font (Google Fonts)

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── assets/         # SCSS, audio, images
├── router/         # Vue Router config
├── types/          # TypeScript types & data helpers
│   ├── pomodoro.ts # Preset definitions
│   └── stats.ts    # localStorage persistence & aggregation
└── views/
    ├── HomeView.vue  # Landing page with launch & stats buttons
    ├── TimerView.vue # Pomodoro timer (runs in popup)
    └── StatsView.vue # 14-day study minutes bar chart
```