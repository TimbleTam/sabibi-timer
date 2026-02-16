export interface PomodoroPreset {
  label: string
  studyMinutes: number
  breakMinutes: number
}

export const presets: PomodoroPreset[] = [
  { label: 'Light', studyMinutes: 25, breakMinutes: 5 },
  { label: 'Standard', studyMinutes: 50, breakMinutes: 10 },
  { label: 'Deep Focus', studyMinutes: 80, breakMinutes: 20 },
]
