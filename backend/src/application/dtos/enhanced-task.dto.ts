import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  ArrayNotEmpty,
  IsObject
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { 
  TaskStatus, 
  TaskPriority, 
  TaskType 
} from '../../domain/entities/enhanced-task.entity';

// ==================== CREATE TASK DTOs ====================

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ 
    example: 'Create login/register functionality with JWT tokens',
    maxLength: 2000 
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  @ApiPropertyOptional({ enum: TaskType, default: TaskType.TASK })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType = TaskType.TASK;

  @ApiPropertyOptional({ example: 8, minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-20' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  assignedToId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  projectId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentTaskId?: number;

  @ApiPropertyOptional({ example: ['backend', 'authentication', 'security'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: { customField1: 'value1' } })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

// ==================== UPDATE TASK DTOs ====================

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated task title' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ example: 'Updated task description' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  estimatedHours?: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-20' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: ['updated', 'tags'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiPropertyOptional({ example: 'Task is blocked due to missing requirements' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class AssignTaskDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  assignedToId: number;
}

export class MoveTaskDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  projectId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentTaskId?: number;
}

// ==================== COMMENT DTOs ====================

export class CreateCommentDto {
  @ApiProperty({ example: 'This task needs more clarification on requirements' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  content: string;
}

export class UpdateCommentDto {
  @ApiProperty({ example: 'Updated comment content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  content: string;
}

// ==================== TIME TRACKING DTOs ====================

export class CreateTimeLogDto {
  @ApiProperty({ example: 120, description: 'Time spent in minutes' })
  @IsNumber()
  @Min(1)
  @Max(24 * 60) // Max 24 hours
  timeSpent: number;

  @ApiProperty({ example: 'Worked on implementing user authentication' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  loggedDate?: string;
}

export class UpdateTimeLogDto {
  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(24 * 60)
  timeSpent?: number;

  @ApiPropertyOptional({ example: 'Updated work description' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  loggedDate?: string;
}

// ==================== DEPENDENCY DTOs ====================

export class CreateDependencyDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  dependsOnTaskId: number;

  @ApiProperty({ 
    example: 'BLOCKS', 
    enum: ['BLOCKS', 'RELATED', 'SUBTASK'],
    description: 'Type of dependency relationship'
  })
  @IsString()
  @IsNotEmpty()
  dependencyType: 'BLOCKS' | 'RELATED' | 'SUBTASK';
}

// ==================== QUERY DTOs ====================

export class TaskQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskType })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  assignedToId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  createdById?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  projectId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentTaskId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isOverdue?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isArchived?: boolean = false;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dueDateAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dueDateBefore?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ example: 'authentication task' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ example: ['backend', 'security'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasEstimate?: boolean;
}

// ==================== BULK OPERATIONS DTOs ====================

export class BulkUpdateStatusDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  taskIds: number[];

  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class BulkAssignDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  taskIds: number[];

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  assignedToId: number;
}

export class BulkUpdatePriorityDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  taskIds: number[];

  @ApiProperty({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}

export class BulkMoveDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  taskIds: number[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  projectId?: number;
}

// ==================== RESPONSE DTOs ====================

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string | null;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TaskMaster Mobile App' })
  name: string;

  @ApiProperty({ example: 'ACTIVE' })
  status: string;
}

export class TaskCommentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Great progress on this task!' })
  content: string;

  @ApiProperty({ example: 1 })
  authorId: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: UserResponseDto })
  author?: UserResponseDto;
}

export class TaskAttachmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'document.pdf' })
  filename: string;

  @ApiProperty({ example: 'Requirements Document.pdf' })
  originalName: string;

  @ApiProperty({ example: 1024000 })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 1 })
  uploadedById: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ type: UserResponseDto })
  uploadedBy?: UserResponseDto;
}

export class TaskTimeLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Implemented user authentication logic' })
  description: string;

  @ApiProperty({ example: 120, description: 'Time in minutes' })
  timeSpent: number;

  @ApiProperty({ example: 1 })
  loggedById: number;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  loggedDate: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiPropertyOptional({ type: UserResponseDto })
  loggedBy?: UserResponseDto;
}

export class TaskDependencyResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  taskId: number;

  @ApiProperty({ example: 2 })
  dependsOnTaskId: number;

  @ApiProperty({ example: 'BLOCKS' })
  dependencyType: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}

export class TaskResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Implement user authentication' })
  title: string;

  @ApiPropertyOptional({ example: 'Create login/register functionality with JWT tokens' })
  description: string | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskType, example: TaskType.FEATURE })
  type: TaskType;

  @ApiPropertyOptional({ example: 8 })
  estimatedHours: number | null;

  @ApiPropertyOptional({ example: 6.5 })
  actualHours: number | null;

  @ApiPropertyOptional({ example: '2024-01-15T09:00:00Z' })
  startDate: Date | null;

  @ApiPropertyOptional({ example: '2024-01-20T17:00:00Z' })
  dueDate: Date | null;

  @ApiPropertyOptional({ example: '2024-01-19T16:30:00Z' })
  completedAt: Date | null;

  @ApiProperty({ example: 1 })
  createdById: number;

  @ApiPropertyOptional({ example: 2 })
  assignedToId: number | null;

  @ApiPropertyOptional({ example: 1 })
  projectId: number | null;

  @ApiPropertyOptional({ example: 1 })
  parentTaskId: number | null;

  @ApiProperty({ example: false })
  isArchived: boolean;

  @ApiPropertyOptional({ example: ['backend', 'authentication'] })
  tags: string[] | null;

  @ApiPropertyOptional({ example: { customField: 'value' } })
  customFields: Record<string, any> | null;

  @ApiProperty({ example: '2024-01-15T08:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  // Relationships
  @ApiPropertyOptional({ type: UserResponseDto })
  createdBy?: UserResponseDto;

  @ApiPropertyOptional({ type: UserResponseDto })
  assignedTo?: UserResponseDto;

  @ApiPropertyOptional({ type: ProjectResponseDto })
  project?: ProjectResponseDto;

  @ApiPropertyOptional({ type: TaskResponseDto })
  parentTask?: TaskResponseDto;

  @ApiPropertyOptional({ type: [TaskResponseDto] })
  subTasks?: TaskResponseDto[];

  @ApiPropertyOptional({ type: [TaskCommentResponseDto] })
  comments?: TaskCommentResponseDto[];

  @ApiPropertyOptional({ type: [TaskAttachmentResponseDto] })
  attachments?: TaskAttachmentResponseDto[];

  @ApiPropertyOptional({ type: [TaskTimeLogResponseDto] })
  timeLogs?: TaskTimeLogResponseDto[];

  @ApiPropertyOptional({ type: [TaskDependencyResponseDto] })
  dependencies?: TaskDependencyResponseDto[];

  // Computed fields
  @ApiPropertyOptional({ example: true })
  isOverdue?: boolean;

  @ApiPropertyOptional({ example: false })
  isDueToday?: boolean;

  @ApiPropertyOptional({ example: true })
  isDueSoon?: boolean;

  @ApiPropertyOptional({ example: 75 })
  progress?: number;

  @ApiPropertyOptional({ example: { completed: 2, total: 3, percentage: 67 } })
  subtaskProgress?: {
    completed: number;
    total: number;
    percentage: number;
  };

  @ApiPropertyOptional({ example: 480, description: 'Total time spent in minutes' })
  totalTimeSpent?: number;

  @ApiPropertyOptional({ example: 85 })
  estimateAccuracy?: number | null;
}

export class TaskSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Implement user authentication' })
  title: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskType, example: TaskType.FEATURE })
  type: TaskType;

  @ApiPropertyOptional({ example: '2024-01-20T17:00:00Z' })
  dueDate: Date | null;

  @ApiPropertyOptional({ example: 2 })
  assignedToId: number | null;

  @ApiProperty({ example: 75 })
  progress: number;

  @ApiProperty({ example: true })
  isOverdue: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

// ==================== PAGINATED RESPONSES ====================

export class PaginatedTasksResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  tasks: TaskResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedTaskSummariesResponseDto {
  @ApiProperty({ type: [TaskSummaryDto] })
  tasks: TaskSummaryDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

// ==================== STATISTICS DTOs ====================

export class TaskStatisticsDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 45 })
  completed: number;

  @ApiProperty({ example: 25 })
  inProgress: number;

  @ApiProperty({ example: 50 })
  todo: number;

  @ApiProperty({ example: 8 })
  overdue: number;

  @ApiProperty({ example: 5 })
  blocked: number;

  @ApiProperty({ example: 12 })
  highPriority: number;

  @ApiProperty({ example: 3.5, description: 'Average completion time in days' })
  avgCompletionTime: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      [TaskPriority.LOW]: 30,
      [TaskPriority.MEDIUM]: 80,
      [TaskPriority.HIGH]: 30,
      [TaskPriority.CRITICAL]: 10
    }
  })
  byPriority: Record<TaskPriority, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      [TaskStatus.TODO]: 50,
      [TaskStatus.IN_PROGRESS]: 25,
      [TaskStatus.REVIEW]: 10,
      [TaskStatus.DONE]: 45,
      [TaskStatus.BLOCKED]: 5
    }
  })
  byStatus: Record<TaskStatus, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      [TaskType.TASK]: 60,
      [TaskType.BUG]: 20,
      [TaskType.FEATURE]: 30,
      [TaskType.IMPROVEMENT]: 15
    }
  })
  byType: Record<TaskType, number>;
}

export class UserTaskStatisticsDto {
  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 30 })
  completed: number;

  @ApiProperty({ example: 8 })
  inProgress: number;

  @ApiProperty({ example: 7 })
  todo: number;

  @ApiProperty({ example: 3 })
  overdue: number;

  @ApiProperty({ example: 2 })
  blocked: number;

  @ApiProperty({ example: 5 })
  highPriority: number;

  @ApiProperty({ example: 2.8 })
  avgCompletionTime: number;

  @ApiProperty({ example: 85.5 })
  estimateAccuracy: number;

  @ApiProperty({ example: 78.2 })
  onTimeCompletionRate: number;
}

export class ProductivityMetricsDto {
  @ApiProperty({ example: 25 })
  tasksCompleted: number;

  @ApiProperty({ example: 3.5 })
  avgTasksPerDay: number;

  @ApiProperty({ example: 480, description: 'Total time spent in minutes' })
  timeSpent: number;

  @ApiProperty({ example: 19.2, description: 'Average time per task in minutes' })
  avgTimePerTask: number;

  @ApiProperty({ example: 85.5 })
  estimateAccuracy: number;

  @ApiProperty({ example: 78.2 })
  onTimeCompletionRate: number;
}

export class DashboardTasksDto {
  @ApiProperty({ type: [TaskSummaryDto] })
  assigned: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  created: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  inProgress: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  overdue: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  dueToday: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  dueSoon: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  recent: TaskSummaryDto[];
}

export class ProjectDashboardTasksDto {
  @ApiProperty({ type: [TaskSummaryDto] })
  todo: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  inProgress: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  review: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  testing: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  blocked: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  recent: TaskSummaryDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  overdue: TaskSummaryDto[];
}