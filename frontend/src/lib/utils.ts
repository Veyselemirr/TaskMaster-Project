import { clsx, type ClassValue } from "clsx"
import { format, formatDistanceToNow, isToday, isPast, isThisWeek } from "date-fns"
import { TaskStatus, TaskPriority, TaskType, Task } from "@/types/task"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Date utilities
export function formatDate(date: Date | string | null, formatStr: string = 'MMM dd, yyyy'): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

export function formatRelativeDate(date: Date | string | null): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

export function isDateOverdue(date: Date | string | null): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return isPast(dateObj) && !isToday(dateObj)
}

export function isDateDueToday(date: Date | string | null): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return isToday(dateObj)
}

export function isDateDueSoon(date: Date | string | null, days: number = 3): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return isThisWeek(dateObj)
}

// Task utilities
export function getTaskStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200'
    case TaskStatus.IN_PROGRESS:
      return 'bg-primary-100 text-primary-800 border-primary-200'
    case TaskStatus.REVIEW:
      return 'bg-brown-100 text-brown-800 border-brown-200'
    case TaskStatus.TESTING:
      return 'bg-warning-100 text-warning-800 border-warning-200'
    case TaskStatus.DONE:
      return 'bg-success-100 text-success-800 border-success-200'
    case TaskStatus.BLOCKED:
      return 'bg-error-100 text-error-800 border-error-200'
    case TaskStatus.CANCELLED:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200'
    default:
      return 'bg-neutral-100 text-neutral-800 border-neutral-200'
  }
}

export function getTaskPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.LOW:
      return 'bg-success-50 text-success-700 border-success-200'
    case TaskPriority.MEDIUM:
      return 'bg-warning-50 text-warning-700 border-warning-200'
    case TaskPriority.HIGH:
      return 'bg-primary-50 text-primary-700 border-primary-200'
    case TaskPriority.CRITICAL:
      return 'bg-error-50 text-error-700 border-error-200'
    default:
      return 'bg-neutral-50 text-neutral-700 border-neutral-200'
  }
}

export function getTaskTypeColor(type: TaskType): string {
  switch (type) {
    case TaskType.TASK:
      return 'bg-primary-50 text-primary-700 border-primary-200'
    case TaskType.BUG:
      return 'bg-error-50 text-error-700 border-error-200'
    case TaskType.FEATURE:
      return 'bg-success-50 text-success-700 border-success-200'
    case TaskType.EPIC:
      return 'bg-brown-50 text-brown-700 border-brown-200'
    case TaskType.STORY:
      return 'bg-primary-50 text-primary-700 border-primary-200'
    case TaskType.IMPROVEMENT:
      return 'bg-warning-50 text-warning-700 border-warning-200'
    default:
      return 'bg-neutral-50 text-neutral-700 border-neutral-200'
  }
}

export function getTaskStatusIcon(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return '○'
    case TaskStatus.IN_PROGRESS:
      return '◐'
    case TaskStatus.REVIEW:
      return '👁'
    case TaskStatus.TESTING:
      return '🧪'
    case TaskStatus.DONE:
      return '✓'
    case TaskStatus.BLOCKED:
      return '⚠'
    case TaskStatus.CANCELLED:
      return '✕'
    default:
      return '○'
  }
}

export function getTaskPriorityIcon(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.LOW:
      return '↓'
    case TaskPriority.MEDIUM:
      return '→'
    case TaskPriority.HIGH:
      return '↑'
    case TaskPriority.CRITICAL:
      return '🔥'
    default:
      return '→'
  }
}

// Task calculations
export function calculateTaskProgress(task: Task): number {
  if (task.status === TaskStatus.DONE) return 100
  if (task.status === TaskStatus.TODO) return 0
  if (task.status === TaskStatus.IN_PROGRESS) return 50
  if (task.status === TaskStatus.REVIEW) return 75
  if (task.status === TaskStatus.TESTING) return 85
  return 25 // BLOCKED or other statuses
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) {
    return false
  }
  return isDateOverdue(task.dueDate)
}

export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false
  return isDateDueToday(task.dueDate)
}

export function isTaskDueSoon(task: Task): boolean {
  if (!task.dueDate) return false
  return isDateDueSoon(task.dueDate)
}

// Time formatting
export function formatMinutesToHours(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

// Array utilities
export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const group = key(item)
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {} as Record<K, T[]>)
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}