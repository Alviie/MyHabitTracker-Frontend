export interface Habit {
  id: number
  name: string
  icon?: string
  completions?: { date: string; completed: boolean }[]
}
