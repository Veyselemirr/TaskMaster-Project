export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TaskType {
  TASK = 'TASK',
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  EPIC = 'EPIC',
  STORY = 'STORY',
  IMPROVEMENT = 'IMPROVEMENT'
}

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface Project {
  id: number;
  name: string;
  status: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface TaskTimeLog {
  id: number;
  taskId: number;
  description: string;
  timeSpent: number; // in minutes
  loggedById: number;
  loggedDate: Date;
  createdAt: Date;
  loggedBy?: User;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  estimatedHours: number | null;
  actualHours: number | null;
  startDate: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  createdById: number;
  assignedToId: number | null;
  projectId: number | null;
  parentTaskId: number | null;
  isArchived: boolean;
  tags: string[] | null;
  customFields: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  createdBy?: User;
  assignedTo?: User;
  project?: Project;
  parentTask?: Task;
  subTasks?: Task[];
  comments?: TaskComment[];
  timeLogs?: TaskTimeLog[];
  
  // Computed fields
  isOverdue?: boolean;
  isDueToday?: boolean;
  isDueSoon?: boolean;
  progress?: number;
  subtaskProgress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  totalTimeSpent?: number;
  estimateAccuracy?: number | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignedToId?: number;
  createdById?: number;
  projectId?: number;
  isOverdue?: boolean;
  search?: string;
  tags?: string[];
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  type?: TaskType;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  assignedToId?: number;
  projectId?: number;
  parentTaskId?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  type?: TaskType;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  blocked: number;
  highPriority: number;
  avgCompletionTime: number;
}