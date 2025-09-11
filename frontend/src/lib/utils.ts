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
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case TaskStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case TaskStatus.REVIEW:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case TaskStatus.TESTING:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case TaskStatus.DONE:
      return 'bg-green-100 text-green-800 border-green-200'
    case TaskStatus.BLOCKED:
      return 'bg-red-100 text-red-800 border-red-200'
    case TaskStatus.CANCELLED:
      return 'bg-gray-100 text-gray-600 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTaskPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.LOW:
      return 'bg-green-50 text-green-700 border-green-200'
    case TaskPriority.MEDIUM:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case TaskPriority.HIGH:
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case TaskPriority.CRITICAL:
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export function getTaskTypeColor(type: TaskType): string {
  switch (type) {
    case TaskType.TASK:
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case TaskType.BUG:
      return 'bg-red-50 text-red-700 border-red-200'
    case TaskType.FEATURE:
      return 'bg-green-50 text-green-700 border-green-200'
    case TaskType.EPIC:
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case TaskType.STORY:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200'
    case TaskType.IMPROVEMENT:
      return 'bg-teal-50 text-teal-700 border-teal-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
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