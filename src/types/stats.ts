export interface StudyCompletion {
  date: string // ISO date string, e.g. "2026-02-16"
  studyMinutes: number
}

const STORAGE_KEY = 'sabibi-timer-completions'

export function saveCompletion(studyMinutes: number): void {
  const completions = loadCompletions()
  completions.push({
    date: new Date().toISOString().slice(0, 10),
    studyMinutes,
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(completions))
}

export function loadCompletions(): StudyCompletion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function aggregateByDay(
  completions: StudyCompletion[],
  days = 14,
): { date: string; totalMinutes: number }[] {
  const today = new Date()
  const result: { date: string; totalMinutes: number }[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const total = completions
      .filter((c) => c.date === dateStr)
      .reduce((sum, c) => sum + c.studyMinutes, 0)
    result.push({ date: dateStr, totalMinutes: total })
  }

  return result
}
