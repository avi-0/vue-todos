import type { Ref } from 'vue'

export type Task = {
  id: string
  description: string
  completed: boolean
  repeatEnabled: boolean
  cooldownSeconds: number
  lastCompleted: Date
}

export type TasksStore = {
  tasks: Ref<Task[]>
  create: (task: Partial<Task>) => void
  update: (task: Task) => void
  delete: (task: Task) => void
}

export const defaultCooldownSeconds = 86400

export function taskCooldown(task: Task) {
  const c = task.cooldownSeconds
  return c <= 1 ? defaultCooldownSeconds : c
}

export function taskCompleted(task: Task, now: Date) {
  if (task.repeatEnabled) {
    return now.getTime() < task.lastCompleted.getTime() + taskCooldown(task) * 1000
  } else {
    return task.completed
  }
}
