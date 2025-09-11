import { Role } from '../../common/enums/role.enum';

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

export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface TaskAttachment {
  id: number;
  taskId: number;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedById: number;
  createdAt: Date;
  uploadedBy?: User;
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

export interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  dependencyType: 'BLOCKS' | 'RELATED' | 'SUBTASK';
  createdAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  status: string;
}

export class Task {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: TaskStatus,
    public readonly priority: TaskPriority,
    public readonly type: TaskType,
    public readonly estimatedHours: number | null,
    public readonly actualHours: number | null,
    public readonly startDate: Date | null,
    public readonly dueDate: Date | null,
    public readonly completedAt: Date | null,
    public readonly createdById: number,
    public readonly assignedToId: number | null,
    public readonly projectId: number | null,
    public readonly parentTaskId: number | null,
    public readonly isArchived: boolean,
    public readonly tags: string[] | null,
    public readonly customFields: Record<string, any> | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    
    // Relationships
    public readonly createdBy?: User,
    public readonly assignedTo?: User,
    public readonly project?: Project,
    public readonly parentTask?: Task,
    public readonly subTasks?: Task[],
    public readonly comments?: TaskComment[],
    public readonly attachments?: TaskAttachment[],
    public readonly timeLogs?: TaskTimeLog[],
    public readonly dependencies?: TaskDependency[]
  ) {}

  // ==================== FACTORY METHODS ====================

  static create(
    title: string,
    description: string | null,
    createdById: number,
    priority: TaskPriority = TaskPriority.MEDIUM,
    type: TaskType = TaskType.TASK,
    projectId?: number,
    assignedToId?: number,
    estimatedHours?: number,
    startDate?: Date,
    dueDate?: Date,
    parentTaskId?: number,
    tags?: string[]
  ): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return new Task(
      0,
      title,
      description,
      TaskStatus.TODO,
      priority,
      type,
      estimatedHours || null,
      null, // actualHours
      startDate || null,
      dueDate || null,
      null, // completedAt
      createdById,
      assignedToId || null,
      projectId || null,
      parentTaskId || null,
      false, // isArchived
      tags || null,
      null, // customFields
      new Date(),
      new Date()
    );
  }

  // ==================== STATUS MANAGEMENT ====================

  startTask(userId: number): Task {
    if (this.status === TaskStatus.DONE || this.status === TaskStatus.CANCELLED) {
      throw new Error('Cannot start completed or cancelled task');
    }
    
    if (this.assignedToId && this.assignedToId !== userId && this.createdById !== userId) {
      throw new Error('Only assigned user or creator can start this task');
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.IN_PROGRESS,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate || new Date(),
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  moveToReview(userId: number): Task {
    if (this.status !== TaskStatus.IN_PROGRESS) {
      throw new Error('Task must be in progress to move to review');
    }

    if (this.assignedToId && this.assignedToId !== userId) {
      throw new Error('Only assigned user can move task to review');
    }

    return this.updateStatus(TaskStatus.REVIEW);
  }

  completeTask(userId: number): Task {
    if (this.status === TaskStatus.DONE || this.status === TaskStatus.CANCELLED) {
      throw new Error('Task is already completed or cancelled');
    }

    if (this.assignedToId && this.assignedToId !== userId && this.createdById !== userId) {
      throw new Error('Only assigned user or creator can complete this task');
    }

    // Check if all subtasks are completed
    if (this.subTasks && this.subTasks.some(subtask => subtask.status !== TaskStatus.DONE)) {
      throw new Error('All subtasks must be completed before marking parent task as done');
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.DONE,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      new Date(),
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  blockTask(reason: string): Task {
    if (this.status === TaskStatus.DONE || this.status === TaskStatus.CANCELLED) {
      throw new Error('Cannot block completed or cancelled task');
    }

    const customFields = { ...this.customFields, blockReason: reason };

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.BLOCKED,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  unblockTask(): Task {
    if (this.status !== TaskStatus.BLOCKED) {
      throw new Error('Task is not blocked');
    }

    const customFields = { ...this.customFields };
    delete customFields.blockReason;

    return new Task(
      this.id,
      this.title,
      this.description,
      TaskStatus.TODO,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  // ==================== ASSIGNMENT MANAGEMENT ====================

  assignTo(userId: number, assignerId: number): Task {
    if (!this.canUserEdit(assignerId)) {
      throw new Error('User does not have permission to assign this task');
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      userId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  unassign(userId: number): Task {
    if (!this.canUserEdit(userId)) {
      throw new Error('User does not have permission to unassign this task');
    }

    return this.assignTo(null as any, userId);
  }

  // ==================== PROJECT MANAGEMENT ====================

  moveToProject(projectId: number | null, userId: number): Task {
    if (!this.canUserEdit(userId)) {
      throw new Error('User does not have permission to move this task');
    }

    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  // ==================== UPDATE METHODS ====================

  updateBasicInfo(
    title?: string,
    description?: string | null,
    priority?: TaskPriority,
    type?: TaskType,
    estimatedHours?: number | null,
    dueDate?: Date | null,
    tags?: string[] | null
  ): Task {
    return new Task(
      this.id,
      title ?? this.title,
      description !== undefined ? description : this.description,
      this.status,
      priority ?? this.priority,
      type ?? this.type,
      estimatedHours !== undefined ? estimatedHours : this.estimatedHours,
      this.actualHours,
      this.startDate,
      dueDate !== undefined ? dueDate : this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      tags !== undefined ? tags : this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  updateStatus(status: TaskStatus): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      status,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      status === TaskStatus.DONE ? new Date() : this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  addTimeLog(timeSpent: number, description: string, userId: number): Task {
    const newTimeLog: TaskTimeLog = {
      id: 0,
      taskId: this.id,
      description,
      timeSpent,
      loggedById: userId,
      loggedDate: new Date(),
      createdAt: new Date()
    };

    const updatedTimeLogs = [...(this.timeLogs || []), newTimeLog];
    const totalLoggedTime = updatedTimeLogs.reduce((total, log) => total + log.timeSpent, 0);

    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.type,
      this.estimatedHours,
      Math.round(totalLoggedTime / 60), // Convert minutes to hours
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      this.isArchived,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      updatedTimeLogs,
      this.dependencies
    );
  }

  archive(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.status,
      this.priority,
      this.type,
      this.estimatedHours,
      this.actualHours,
      this.startDate,
      this.dueDate,
      this.completedAt,
      this.createdById,
      this.assignedToId,
      this.projectId,
      this.parentTaskId,
      true,
      this.tags,
      this.customFields,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.assignedTo,
      this.project,
      this.parentTask,
      this.subTasks,
      this.comments,
      this.attachments,
      this.timeLogs,
      this.dependencies
    );
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  isOverdue(): boolean {
    if (!this.dueDate || this.status === TaskStatus.DONE || this.status === TaskStatus.CANCELLED) {
      return false;
    }
    return this.dueDate < new Date();
  }

  isDueToday(): boolean {
    if (!this.dueDate) return false;
    const today = new Date();
    const due = new Date(this.dueDate);
    return due.toDateString() === today.toDateString();
  }

  isDueSoon(days: number = 3): boolean {
    if (!this.dueDate) return false;
    const now = new Date();
    const daysUntilDue = Math.ceil((this.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= days && daysUntilDue > 0;
  }

  isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.DONE;
  }

  isBlocked(): boolean {
    return this.status === TaskStatus.BLOCKED;
  }

  isHighPriority(): boolean {
    return this.priority === TaskPriority.HIGH || this.priority === TaskPriority.CRITICAL;
  }

  hasEstimateVariance(): boolean {
    if (!this.estimatedHours || !this.actualHours) return false;
    const variance = Math.abs(this.actualHours - this.estimatedHours) / this.estimatedHours;
    return variance > 0.2; // 20% variance
  }

  getEstimateAccuracy(): number | null {
    if (!this.estimatedHours || !this.actualHours) return null;
    return Math.round((1 - Math.abs(this.actualHours - this.estimatedHours) / this.estimatedHours) * 100);
  }

  getTimeSpent(): number {
    if (!this.timeLogs) return 0;
    return this.timeLogs.reduce((total, log) => total + log.timeSpent, 0);
  }

  getProgress(): number {
    if (this.status === TaskStatus.DONE) return 100;
    if (this.status === TaskStatus.TODO) return 0;
    if (this.status === TaskStatus.IN_PROGRESS) return 50;
    if (this.status === TaskStatus.REVIEW) return 75;
    if (this.status === TaskStatus.TESTING) return 85;
    return 25; // BLOCKED or other statuses
  }

  getSubtaskProgress(): { completed: number; total: number; percentage: number } {
    if (!this.subTasks) return { completed: 0, total: 0, percentage: 0 };
    
    const total = this.subTasks.length;
    const completed = this.subTasks.filter(task => task.status === TaskStatus.DONE).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }

  // ==================== PERMISSION METHODS ====================

  canUserView(userId: number, userRole: Role): boolean {
    // Admin can view everything
    if (userRole === Role.ADMIN) return true;
    
    // Creator can always view
    if (this.createdById === userId) return true;
    
    // Assigned user can view
    if (this.assignedToId === userId) return true;
    
    // Project members can view (this would require project member check)
    // For now, return true for project tasks
    if (this.projectId) return true;
    
    return false;
  }

  canUserEdit(userId: number, userRole?: Role): boolean {
    // Admin can edit everything
    if (userRole === Role.ADMIN) return true;
    
    // Creator can always edit
    if (this.createdById === userId) return true;
    
    // Assigned user can edit certain fields
    if (this.assignedToId === userId) return true;
    
    // Project managers can edit (would need project role check)
    if (userRole === Role.PROJECT_MANAGER && this.projectId) return true;
    
    return false;
  }

  canUserDelete(userId: number, userRole?: Role): boolean {
    // Admin can delete everything
    if (userRole === Role.ADMIN) return true;
    
    // Only creator can delete, unless it's a subtask
    return this.createdById === userId;
  }

  canUserAssign(userId: number, userRole?: Role): boolean {
    // Admin can assign everything
    if (userRole === Role.ADMIN) return true;
    
    // Project manager can assign in their projects
    if (userRole === Role.PROJECT_MANAGER && this.projectId) return true;
    
    // Creator can assign
    if (this.createdById === userId) return true;
    
    return false;
  }
}