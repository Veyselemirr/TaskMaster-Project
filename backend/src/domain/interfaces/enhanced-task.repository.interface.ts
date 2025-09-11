import { Task, TaskStatus, TaskPriority, TaskType, TaskComment, TaskAttachment, TaskTimeLog, TaskDependency } from '../entities/enhanced-task.entity';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignedToId?: number;
  createdById?: number;
  projectId?: number;
  parentTaskId?: number;
  isOverdue?: boolean;
  isArchived?: boolean;
  dueDateAfter?: Date;
  dueDateBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  completedAfter?: Date;
  completedBefore?: Date;
  hasEstimate?: boolean;
  tags?: string[];
  search?: string;
}

export interface TaskCommentFilters {
  taskId?: number;
  authorId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface TaskTimeLogFilters {
  taskId?: number;
  loggedById?: number;
  loggedDateAfter?: Date;
  loggedDateBefore?: Date;
}

export interface ITaskRepository {
  // ==================== BASIC CRUD OPERATIONS ====================
  findById(id: number): Promise<Task | null>;
  findByIdWithDetails(id: number): Promise<Task | null>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: number, task: Partial<Task>): Promise<Task>;
  delete(id: number): Promise<void>;
  
  // ==================== ADVANCED QUERIES ====================
  findAll(page?: number, limit?: number, filters?: TaskFilters): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // ==================== USER-BASED QUERIES ====================
  findByUserId(userId: number, filters?: TaskFilters): Promise<Task[]>;
  findAssignedToUser(userId: number, filters?: TaskFilters): Promise<Task[]>;
  findCreatedByUser(userId: number, filters?: TaskFilters): Promise<Task[]>;
  
  // ==================== PROJECT-BASED QUERIES ====================
  findByProjectId(projectId: number, filters?: TaskFilters): Promise<Task[]>;
  findByProjectIdWithPagination(
    projectId: number, 
    page?: number, 
    limit?: number, 
    filters?: TaskFilters
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // ==================== STATUS-BASED QUERIES ====================
  findByStatus(status: TaskStatus, filters?: TaskFilters): Promise<Task[]>;
  findInProgress(userId?: number): Promise<Task[]>;
  findCompleted(userId?: number, dateRange?: { start: Date; end: Date }): Promise<Task[]>;
  findBlocked(userId?: number): Promise<Task[]>;
  
  // ==================== PRIORITY AND TIME-BASED QUERIES ====================
  findByPriority(priority: TaskPriority, filters?: TaskFilters): Promise<Task[]>;
  findHighPriorityTasks(userId?: number): Promise<Task[]>;
  findOverdueTasks(userId?: number): Promise<Task[]>;
  findDueToday(userId?: number): Promise<Task[]>;
  findDueSoon(days: number, userId?: number): Promise<Task[]>;
  findUpcomingTasks(userId: number, days: number): Promise<Task[]>;
  
  // ==================== HIERARCHY AND DEPENDENCIES ====================
  findSubTasks(parentTaskId: number): Promise<Task[]>;
  findParentTasks(userId?: number): Promise<Task[]>;
  findTasksByDepth(maxDepth: number): Promise<Task[]>;
  
  // Dependencies
  findDependencies(taskId: number): Promise<TaskDependency[]>;
  findBlockingTasks(taskId: number): Promise<Task[]>;
  findBlockedTasks(taskId: number): Promise<Task[]>;
  createDependency(taskId: number, dependsOnTaskId: number, type: string): Promise<TaskDependency>;
  deleteDependency(dependencyId: number): Promise<void>;
  
  // ==================== SEARCH AND FILTERING ====================
  searchTasks(query: string, userId?: number, filters?: TaskFilters): Promise<Task[]>;
  findByTags(tags: string[], userId?: number): Promise<Task[]>;
  findTasksWithEstimates(): Promise<Task[]>;
  findTasksWithTimeVariance(threshold: number): Promise<Task[]>;
  
  // ==================== COMMENTS MANAGEMENT ====================
  findComments(taskId: number): Promise<TaskComment[]>;
  createComment(taskId: number, authorId: number, content: string): Promise<TaskComment>;
  updateComment(commentId: number, content: string): Promise<TaskComment>;
  deleteComment(commentId: number): Promise<void>;
  
  // ==================== ATTACHMENTS MANAGEMENT ====================
  findAttachments(taskId: number): Promise<TaskAttachment[]>;
  createAttachment(taskId: number, attachment: Omit<TaskAttachment, 'id' | 'createdAt'>): Promise<TaskAttachment>;
  deleteAttachment(attachmentId: number): Promise<void>;
  
  // ==================== TIME TRACKING ====================
  findTimeLogs(taskId: number, filters?: TaskTimeLogFilters): Promise<TaskTimeLog[]>;
  createTimeLog(timeLog: Omit<TaskTimeLog, 'id' | 'createdAt'>): Promise<TaskTimeLog>;
  updateTimeLog(timeLogId: number, timeLog: Partial<TaskTimeLog>): Promise<TaskTimeLog>;
  deleteTimeLog(timeLogId: number): Promise<void>;
  getTotalTimeSpent(taskId: number): Promise<number>;
  getUserTimeSpent(userId: number, dateRange?: { start: Date; end: Date }): Promise<number>;
  
  // ==================== STATISTICS AND ANALYTICS ====================
  getUserTaskStatistics(userId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    blocked: number;
    highPriority: number;
    avgCompletionTime: number;
  }>;
  
  getProjectTaskStatistics(projectId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    blocked: number;
    byPriority: Record<TaskPriority, number>;
    byStatus: Record<TaskStatus, number>;
    byType: Record<TaskType, number>;
    avgCompletionTime: number;
    totalTimeSpent: number;
  }>;
  
  getGlobalTaskStatistics(): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    blocked: number;
    byPriority: Record<TaskPriority, number>;
    byStatus: Record<TaskStatus, number>;
    byType: Record<TaskType, number>;
    avgCompletionTime: number;
    totalTimeSpent: number;
    topPerformers: Array<{
      userId: number;
      completedTasks: number;
      avgCompletionTime: number;
    }>;
  }>;
  
  getTaskCompletionTrend(
    userId?: number, 
    projectId?: number, 
    days?: number
  ): Promise<Array<{
    date: Date;
    completed: number;
    created: number;
  }>>;
  
  getProductivityMetrics(userId: number, dateRange?: { start: Date; end: Date }): Promise<{
    tasksCompleted: number;
    avgTasksPerDay: number;
    timeSpent: number;
    avgTimePerTask: number;
    estimateAccuracy: number;
    onTimeCompletionRate: number;
  }>;
  
  // ==================== DASHBOARD QUERIES ====================
  findUserDashboardTasks(userId: number): Promise<{
    assigned: Task[];
    created: Task[];
    inProgress: Task[];
    overdue: Task[];
    dueToday: Task[];
    dueSoon: Task[];
    recent: Task[];
  }>;
  
  findProjectDashboardTasks(projectId: number): Promise<{
    todo: Task[];
    inProgress: Task[];
    review: Task[];
    testing: Task[];
    blocked: Task[];
    recent: Task[];
    overdue: Task[];
  }>;
  
  // ==================== BULK OPERATIONS ====================
  bulkUpdateStatus(taskIds: number[], status: TaskStatus): Promise<void>;
  bulkAssign(taskIds: number[], assignedToId: number): Promise<void>;
  bulkUpdatePriority(taskIds: number[], priority: TaskPriority): Promise<void>;
  bulkMoveToProject(taskIds: number[], projectId: number): Promise<void>;
  bulkArchive(taskIds: number[]): Promise<void>;
  bulkDelete(taskIds: number[]): Promise<void>;
  
  // ==================== ARCHIVE OPERATIONS ====================
  archiveTask(id: number): Promise<void>;
  restoreTask(id: number): Promise<void>;
  findArchivedTasks(userId?: number, projectId?: number): Promise<Task[]>;
  
  // ==================== NOTIFICATION QUERIES ====================
  findTasksRequiringAttention(userId: number): Promise<Task[]>;
  findTasksWithUpdates(userId: number, since: Date): Promise<Task[]>;
  findMentionedTasks(userId: number): Promise<Task[]>;
  
  // ==================== REPORTING QUERIES ====================
  getTasksByDateRange(
    startDate: Date, 
    endDate: Date, 
    userId?: number, 
    projectId?: number
  ): Promise<Task[]>;
  
  getCompletionRate(
    userId?: number, 
    projectId?: number, 
    dateRange?: { start: Date; end: Date }
  ): Promise<number>;
  
  getAverageTaskDuration(
    userId?: number, 
    projectId?: number, 
    taskType?: TaskType
  ): Promise<number>;
  
  getTaskDistribution(
    groupBy: 'status' | 'priority' | 'type' | 'assignee',
    userId?: number,
    projectId?: number
  ): Promise<Record<string, number>>;
}

export const ENHANCED_TASK_REPOSITORY = Symbol('ENHANCED_TASK_REPOSITORY');