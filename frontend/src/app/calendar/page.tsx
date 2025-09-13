'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Filter,
  Grid3X3,
  List,
  MoreVertical
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { getTaskStatusColor, getTaskPriorityColor, formatDate } from '@/lib/utils'

// Enhanced mock data with more dates for calendar
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Implement user authentication system",
    description: "Create login/register functionality with JWT tokens and password reset",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 16,
    actualHours: 8,
    startDate: new Date('2024-09-11'),
    dueDate: new Date('2024-09-15'),
    completedAt: null,
    createdById: 1,
    assignedToId: 2,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['authentication', 'security', 'backend'],
    customFields: null,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-11'),
    assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 65
  },
  {
    id: 2,
    title: "Fix responsive layout issues",
    description: "Mobile layout breaks on smaller screens",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    type: TaskType.BUG,
    estimatedHours: 4,
    actualHours: null,
    startDate: new Date('2024-09-12'),
    dueDate: new Date('2024-09-14'),
    completedAt: null,
    createdById: 1,
    assignedToId: null,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['frontend', 'css', 'mobile'],
    customFields: null,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-10'),
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 0
  },
  {
    id: 3,
    title: "Database optimization",
    description: "Optimize database queries and add proper indexing",
    status: TaskStatus.REVIEW,
    priority: TaskPriority.CRITICAL,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 12,
    actualHours: 8,
    startDate: new Date('2024-09-13'),
    dueDate: new Date('2024-09-18'),
    completedAt: null,
    createdById: 1,
    assignedToId: 2,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['database', 'performance', 'backend'],
    customFields: null,
    createdAt: new Date('2024-09-12'),
    updatedAt: new Date('2024-09-13'),
    assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 75
  },
  {
    id: 4,
    title: "Design system documentation",
    description: "Create comprehensive design system documentation",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    type: TaskType.TASK,
    estimatedHours: 6,
    actualHours: 5,
    startDate: new Date('2024-09-09'),
    dueDate: new Date('2024-09-11'),
    completedAt: new Date('2024-09-11'),
    createdById: 1,
    assignedToId: 3,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['design', 'documentation'],
    customFields: null,
    createdAt: new Date('2024-09-08'),
    updatedAt: new Date('2024-09-11'),
    assignedTo: { id: 3, email: 'sarah@example.com', name: 'Sarah Wilson' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 100
  },
  {
    id: 5,
    title: "API rate limiting implementation",
    description: "Implement rate limiting for all API endpoints",
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 8,
    actualHours: null,
    startDate: new Date('2024-09-16'),
    dueDate: new Date('2024-09-20'),
    completedAt: null,
    createdById: 1,
    assignedToId: 2,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['api', 'security', 'backend'],
    customFields: null,
    createdAt: new Date('2024-09-11'),
    updatedAt: new Date('2024-09-11'),
    assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 0
  },
  {
    id: 6,
    title: "Mobile app testing",
    description: "Comprehensive testing of mobile application",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TESTING,
    estimatedHours: 10,
    actualHours: 3,
    startDate: new Date('2024-09-17'),
    dueDate: new Date('2024-09-22'),
    completedAt: null,
    createdById: 1,
    assignedToId: 4,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['mobile', 'testing', 'qa'],
    customFields: null,
    createdAt: new Date('2024-09-11'),
    updatedAt: new Date('2024-09-11'),
    assignedTo: { id: 4, email: 'qa@example.com', name: 'QA Team' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 30
  }
]

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)
  const [filteredStatuses, setFilteredStatuses] = React.useState<TaskStatus[]>([])

  // Helper functions
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  const getMonthEnd = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  const getCalendarDays = () => {
    const monthStart = getMonthStart(currentDate)
    const monthEnd = getMonthEnd(currentDate)
    const startDate = new Date(monthStart)
    const endDate = new Date(monthEnd)

    // Start from the beginning of the week
    startDate.setDate(startDate.getDate() - startDate.getDay())
    // End at the end of the week
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const current = new Date(startDate)

    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return mockTasks.filter(task => {
      if (filteredStatuses.length > 0 && !filteredStatuses.includes(task.status)) {
        return false
      }
      
      const startDate = task.startDate ? new Date(task.startDate).toDateString() : null
      const dueDate = task.dueDate ? new Date(task.dueDate).toDateString() : null
      
      return startDate === dateStr || dueDate === dateStr
    })
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  const getHourSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      slots.push({
        hour,
        display: `${displayHour}:00 ${ampm}`,
        tasks: mockTasks.filter(task => {
          // Simple logic: distribute tasks throughout the day based on priority
          if (task.priority === TaskPriority.CRITICAL && hour >= 9 && hour <= 11) return true
          if (task.priority === TaskPriority.HIGH && hour >= 13 && hour <= 15) return true
          if (task.priority === TaskPriority.MEDIUM && hour >= 16 && hour <= 17) return true
          return false
        })
      })
    }
    return slots
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'month') {
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
      } else if (viewMode === 'week') {
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 7)
        } else {
          newDate.setDate(prev.getDate() + 7)
        }
      } else if (viewMode === 'day') {
        if (direction === 'prev') {
          newDate.setDate(prev.getDate() - 1)
        } else {
          newDate.setDate(prev.getDate() + 1)
        }
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const toggleStatusFilter = (status: TaskStatus) => {
    setFilteredStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const calendarDays = getCalendarDays()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Calendar</h1>
            <p className="mt-1 text-neutral-600">
              View and manage your tasks by date
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && `Week of ${formatDate(getWeekDays()[0], 'MMM dd')} - ${formatDate(getWeekDays()[6], 'MMM dd, yyyy')}`}
              {viewMode === 'day' && formatDate(currentDate, 'EEEE, MMMM dd, yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>

          {/* View Mode */}
          <div className="flex rounded-lg border border-neutral-300 p-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-sm font-medium capitalize rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-neutral-900">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                {Object.values(TaskStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      filteredStatuses.includes(status)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{status.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
              {filteredStatuses.length > 0 && (
                <button
                  onClick={() => setFilteredStatuses([])}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-8 gap-px bg-neutral-200 rounded-lg overflow-hidden">
                {/* Time column header */}
                <div className="bg-neutral-50 p-3 text-center text-sm font-medium text-neutral-600">
                  Time
                </div>
                
                {/* Day headers */}
                {getWeekDays().map((date, index) => (
                  <div
                    key={index}
                    className={`bg-neutral-50 p-3 text-center ${
                      isToday(date) ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'
                    }`}
                  >
                    <div className="text-sm font-medium">{DAYS_OF_WEEK[date.getDay()]}</div>
                    <div className={`text-lg font-semibold ${
                      isToday(date) ? 'bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1' : ''
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}

                {/* Time slots */}
                {Array.from({ length: 12 }, (_, hour) => (
                  <React.Fragment key={hour + 8}>
                    {/* Time label */}
                    <div className="bg-white p-2 border-r border-neutral-200 text-xs text-neutral-500 text-center">
                      {hour + 8 === 12 ? '12:00 PM' : hour + 8 > 12 ? `${hour + 8 - 12}:00 PM` : `${hour + 8}:00 AM`}
                    </div>
                    
                    {/* Day columns */}
                    {getWeekDays().map((date, dayIndex) => {
                      const dayTasks = getTasksForDate(date).filter(task => {
                        // Distribute tasks across working hours (8 AM - 8 PM)
                        const taskHour = (task.id % 12) + 8
                        return taskHour === hour + 8
                      })
                      
                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className="bg-white p-2 min-h-[60px] hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100"
                          onClick={() => setSelectedDate(date)}
                        >
                          {dayTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 mb-1 rounded truncate ${
                                task.status === TaskStatus.DONE
                                  ? 'bg-success-100 text-success-700'
                                  : task.status === TaskStatus.IN_PROGRESS
                                  ? 'bg-warning-100 text-warning-700'
                                  : task.status === TaskStatus.BLOCKED
                                  ? 'bg-error-100 text-error-700'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main day schedule */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {formatDate(currentDate, 'EEEE, MMMM dd, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-px">
                    {getHourSlots().map((slot) => (
                      <div
                        key={slot.hour}
                        className="flex border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        {/* Time */}
                        <div className="w-20 p-3 text-sm text-neutral-500 bg-neutral-50">
                          {slot.display}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-3 min-h-[60px]">
                          {slot.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-2 mb-2 rounded-lg border-l-4 ${
                                task.priority === TaskPriority.CRITICAL
                                  ? 'border-error-500 bg-error-50'
                                  : task.priority === TaskPriority.HIGH
                                  ? 'border-warning-500 bg-warning-50'
                                  : 'border-primary-500 bg-primary-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-neutral-900 text-sm">
                                  {task.title}
                                </h4>
                                <Badge className={getTaskStatusColor(task.status)} size="sm">
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              {task.description && (
                                <p className="text-xs text-neutral-600 mt-1 truncate">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-3 mt-2">
                                <Badge className={getTaskPriorityColor(task.priority)} size="sm">
                                  {task.priority}
                                </Badge>
                                {task.assignedTo && (
                                  <div className="flex items-center space-x-1 text-xs text-neutral-600">
                                    <User className="h-3 w-3" />
                                    <span>{task.assignedTo.name}</span>
                                  </div>
                                )}
                                {task.estimatedHours && (
                                  <div className="flex items-center space-x-1 text-xs text-neutral-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{task.estimatedHours}h</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {slot.tasks.length === 0 && slot.hour >= 9 && slot.hour <= 18 && (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm cursor-pointer hover:text-neutral-600">
                              Click to add task
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Day sidebar */}
            <div className="space-y-4">
              {/* Today's summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Total Tasks</span>
                      <span className="font-semibold text-neutral-900">
                        {getTasksForDate(currentDate).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Completed</span>
                      <span className="font-semibold text-success-600">
                        {getTasksForDate(currentDate).filter(t => t.status === TaskStatus.DONE).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">In Progress</span>
                      <span className="font-semibold text-warning-600">
                        {getTasksForDate(currentDate).filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Remaining</span>
                      <span className="font-semibold text-neutral-600">
                        {getTasksForDate(currentDate).filter(t => t.status === TaskStatus.TODO).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Tracking
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mockTasks
                      .filter(task => {
                        const dueDate = task.dueDate ? new Date(task.dueDate) : null
                        return dueDate && dueDate > new Date() && task.status !== TaskStatus.DONE
                      })
                      .sort((a, b) => {
                        const dateA = a.dueDate ? new Date(a.dueDate) : new Date()
                        const dateB = b.dueDate ? new Date(b.dueDate) : new Date()
                        return dateA.getTime() - dateB.getTime()
                      })
                      .slice(0, 3)
                      .map((task) => (
                        <div key={task.id} className="flex items-center space-x-2 text-sm">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              task.priority === TaskPriority.CRITICAL
                                ? 'bg-error-500'
                                : task.priority === TaskPriority.HIGH
                                ? 'bg-warning-500'
                                : 'bg-primary-500'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-neutral-900">{task.title}</p>
                            <p className="text-neutral-500 text-xs">
                              {task.dueDate ? formatDate(task.dueDate, 'MMM dd') : 'No due date'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Calendar Grid - Month View */}
        {viewMode === 'month' && (
          <Card>
            <CardContent className="p-6">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-px mb-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-neutral-600 bg-neutral-50 rounded-lg"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
                {calendarDays.map((date, index) => {
                  const dayTasks = getTasksForDate(date)
                  const isCurrentDay = isToday(date)
                  const isCurrentMonthDay = isCurrentMonth(date)

                  return (
                    <div
                      key={index}
                      className={`bg-white p-3 min-h-[120px] ${
                        isCurrentDay ? 'bg-primary-50' : ''
                      } ${
                        !isCurrentMonthDay ? 'opacity-50' : ''
                      } hover:bg-neutral-50 transition-colors cursor-pointer`}
                      onClick={() => setSelectedDate(date)}
                    >
                      {/* Date Number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isCurrentDay
                              ? 'text-primary-700 bg-primary-100 w-6 h-6 rounded-full flex items-center justify-center'
                              : isCurrentMonthDay
                              ? 'text-neutral-900'
                              : 'text-neutral-400'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <span className="text-xs text-neutral-500">
                            {dayTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Tasks for this day */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate ${
                              task.status === TaskStatus.DONE
                                ? 'bg-success-100 text-success-700'
                                : task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-warning-100 text-warning-700'
                                : task.status === TaskStatus.BLOCKED
                                ? 'bg-error-100 text-error-700'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-neutral-500 text-center">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Details Sidebar */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  Tasks for {formatDate(selectedDate, 'MMMM dd, yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const dayTasks = getTasksForDate(selectedDate)
                if (dayTasks.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                      <p className="text-neutral-600 mb-4">No tasks scheduled for this date</p>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                            task.status === TaskStatus.DONE
                              ? 'bg-success-500'
                              : task.status === TaskStatus.IN_PROGRESS
                              ? 'bg-warning-500'
                              : task.status === TaskStatus.BLOCKED
                              ? 'bg-error-500'
                              : 'bg-neutral-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 truncate">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getTaskStatusColor(task.status)} size="sm">
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getTaskPriorityColor(task.priority)} size="sm">
                              {task.priority}
                            </Badge>
                            {task.assignedTo && (
                              <div className="flex items-center space-x-1 text-xs text-neutral-600">
                                <User className="h-3 w-3" />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center space-x-1 text-xs text-neutral-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>Due: {formatDate(task.dueDate, 'MMM dd')}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">This Month</p>
                <p className="text-xl font-semibold text-neutral-900">
                  {mockTasks.filter(task => {
                    const dueDate = task.dueDate ? new Date(task.dueDate) : null
                    return dueDate && dueDate.getMonth() === currentDate.getMonth()
                  }).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Due Today</p>
                <p className="text-xl font-semibold text-neutral-900">
                  {getTasksForDate(new Date()).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
                <CalendarIcon className="h-5 w-5 text-error-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Overdue</p>
                <p className="text-xl font-semibold text-neutral-900">
                  {mockTasks.filter(task => {
                    const dueDate = task.dueDate ? new Date(task.dueDate) : null
                    return dueDate && dueDate < new Date() && task.status !== TaskStatus.DONE
                  }).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
                <CalendarIcon className="h-5 w-5 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Completed</p>
                <p className="text-xl font-semibold text-neutral-900">
                  {mockTasks.filter(task => task.status === TaskStatus.DONE).length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}