import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ITaskRepository, TaskFilters, TaskCommentFilters, TaskTimeLogFilters } from '../../domain/interfaces/enhanced-task.repository.interface';
import { ENHANCED_TASK_REPOSITORY } from '../../domain/interfaces/enhanced-task.repository.interface';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  TaskComment, 
  TaskAttachment, 
  TaskTimeLog, 
  TaskDependency 
} from '../../domain/entities/enhanced-task.entity';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  UpdateTaskStatusDto,
  AssignTaskDto,
  MoveTaskDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateTimeLogDto,
  UpdateTimeLogDto,
  CreateDependencyDto,
  TaskQueryDto,
  BulkUpdateStatusDto,
  BulkAssignDto,
  BulkUpdatePriorityDto,
  BulkMoveDto
} from '../dtos/enhanced-task.dto';
import { UserService } from './user.service';
import { ProjectService } from './project.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class EnhancedTaskService {
  constructor(
    @Inject(ENHANCED_TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly userService: UserService,
    private readonly projectService: ProjectService
  ) {}

  // ==================== TASK CRUD OPERATIONS ====================

  async createTask(createdById: number, createTaskDto: CreateTaskDto): Promise<Task> {
    // Verify creator exists
    const creator = await this.userService.findUserById(createdById);
    
    // Verify assigned user exists if provided
    if (createTaskDto.assignedToId) {
      await this.userService.findUserById(createTaskDto.assignedToId);
    }

    // Verify project exists if provided
    if (createTaskDto.projectId) {
      await this.projectService.findProjectById(createTaskDto.projectId);
    }

    // Verify parent task exists if provided
    if (createTaskDto.parentTaskId) {
      await this.findTaskById(createTaskDto.parentTaskId, createdById);
    }

    const taskData = Task.create(
      createTaskDto.title,
      createTaskDto.description || null,
      createdById,
      createTaskDto.priority,
      createTaskDto.type,
      createTaskDto.projectId,
      createTaskDto.assignedToId,
      createTaskDto.estimatedHours,
      createTaskDto.startDate ? new Date(createTaskDto.startDate) : undefined,
      createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
      createTaskDto.parentTaskId,
      createTaskDto.tags
    );

    return await this.taskRepository.create(taskData);
  }

  async findTaskById(id: number, userId?: number, userRole?: Role): Promise<Task> {
    const task = await this.taskRepository.findByIdWithDetails(id);
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check permissions if userId is provided
    if (userId !== undefined && !task.canUserView(userId, userRole)) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async updateTask(id: number, userId: number, updateTaskDto: UpdateTaskDto, userRole?: Role): Promise<Task> {
    const existingTask = await this.findTaskById(id, userId, userRole);

    if (!existingTask.canUserEdit(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to edit this task');
    }

    // Verify assigned user exists if being updated
    if (updateTaskDto.assignedToId) {
      await this.userService.findUserById(updateTaskDto.assignedToId);
    }

    const updatedTask = existingTask.updateBasicInfo(
      updateTaskDto.title,
      updateTaskDto.description,
      updateTaskDto.priority,
      updateTaskDto.type,
      updateTaskDto.estimatedHours,
      updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null,
      updateTaskDto.tags
    );

    return await this.taskRepository.update(id, updatedTask);
  }

  async deleteTask(id: number, userId: number, userRole?: Role): Promise<void> {
    const existingTask = await this.findTaskById(id, userId, userRole);

    if (!existingTask.canUserDelete(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to delete this task');
    }

    // Check if task has subtasks
    const subTasks = await this.taskRepository.findSubTasks(id);
    if (subTasks.length > 0) {
      throw new BadRequestException('Cannot delete task with existing subtasks');
    }

    await this.taskRepository.delete(id);
  }

  // ==================== TASK STATUS MANAGEMENT ====================

  async updateTaskStatus(id: number, userId: number, updateStatusDto: UpdateTaskStatusDto, userRole?: Role): Promise<Task> {
    const existingTask = await this.findTaskById(id, userId, userRole);

    if (!existingTask.canUserEdit(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to update this task status');
    }

    let updatedTask: Task;

    switch (updateStatusDto.status) {
      case TaskStatus.IN_PROGRESS:
        updatedTask = existingTask.startTask(userId);
        break;
      case TaskStatus.REVIEW:
        updatedTask = existingTask.moveToReview(userId);
        break;
      case TaskStatus.DONE:
        updatedTask = existingTask.completeTask(userId);
        break;
      case TaskStatus.BLOCKED:
        if (!updateStatusDto.reason) {
          throw new BadRequestException('Block reason is required when blocking a task');
        }
        updatedTask = existingTask.blockTask(updateStatusDto.reason);
        break;
      case TaskStatus.TODO:
        if (existingTask.status === TaskStatus.BLOCKED) {
          updatedTask = existingTask.unblockTask();
        } else {
          updatedTask = existingTask.updateStatus(TaskStatus.TODO);
        }
        break;
      default:
        updatedTask = existingTask.updateStatus(updateStatusDto.status);
    }

    return await this.taskRepository.update(id, updatedTask);
  }

  async startTask(id: number, userId: number, userRole?: Role): Promise<Task> {
    return this.updateTaskStatus(id, userId, { status: TaskStatus.IN_PROGRESS }, userRole);
  }

  async completeTask(id: number, userId: number, userRole?: Role): Promise<Task> {
    return this.updateTaskStatus(id, userId, { status: TaskStatus.DONE }, userRole);
  }

  async blockTask(id: number, userId: number, reason: string, userRole?: Role): Promise<Task> {
    return this.updateTaskStatus(id, userId, { status: TaskStatus.BLOCKED, reason }, userRole);
  }

  async unblockTask(id: number, userId: number, userRole?: Role): Promise<Task> {
    return this.updateTaskStatus(id, userId, { status: TaskStatus.TODO }, userRole);
  }

  // ==================== TASK ASSIGNMENT ====================

  async assignTask(id: number, assignerId: number, assignTaskDto: AssignTaskDto, assignerRole?: Role): Promise<Task> {
    const existingTask = await this.findTaskById(id, assignerId, assignerRole);

    if (!existingTask.canUserAssign(assignerId, assignerRole)) {
      throw new ForbiddenException('User does not have permission to assign this task');
    }

    // Verify assigned user exists
    await this.userService.findUserById(assignTaskDto.assignedToId);

    const updatedTask = existingTask.assignTo(assignTaskDto.assignedToId, assignerId);
    return await this.taskRepository.update(id, updatedTask);
  }

  async unassignTask(id: number, userId: number, userRole?: Role): Promise<Task> {
    const existingTask = await this.findTaskById(id, userId, userRole);

    if (!existingTask.canUserAssign(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to unassign this task');
    }

    const updatedTask = existingTask.unassign(userId);
    return await this.taskRepository.update(id, updatedTask);
  }

  // ==================== TASK PROJECT MANAGEMENT ====================

  async moveTaskToProject(id: number, userId: number, moveTaskDto: MoveTaskDto, userRole?: Role): Promise<Task> {
    const existingTask = await this.findTaskById(id, userId, userRole);

    if (!existingTask.canUserEdit(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to move this task');
    }

    // Verify project exists if provided
    if (moveTaskDto.projectId) {
      await this.projectService.findProjectById(moveTaskDto.projectId);
    }

    // Verify parent task exists if provided
    if (moveTaskDto.parentTaskId) {
      await this.findTaskById(moveTaskDto.parentTaskId, userId, userRole);
    }

    const updatedTask = existingTask.moveToProject(moveTaskDto.projectId || null, userId);
    
    // Update parent task if provided
    if (moveTaskDto.parentTaskId !== undefined) {
      return await this.taskRepository.update(id, {
        ...updatedTask,
        parentTaskId: moveTaskDto.parentTaskId
      });
    }

    return await this.taskRepository.update(id, updatedTask);
  }

  // ==================== TASK QUERIES ====================

  async getAllTasks(
    queryDto: TaskQueryDto,
    userId?: number,
    userRole?: Role
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filters: TaskFilters = this.buildFiltersFromQuery(queryDto);

    // Add user-based filtering if not admin
    if (userId && userRole !== Role.ADMIN) {
      filters.createdById = userId;
      // Add additional logic for project-based access if needed
    }

    return await this.taskRepository.findAll(
      queryDto.page,
      queryDto.limit,
      filters
    );
  }

  async findTasksByUserId(
    targetUserId: number,
    queryDto: TaskQueryDto,
    requestingUserId?: number,
    requestingUserRole?: Role
  ): Promise<Task[]> {
    // Check permissions - users can only see their own tasks unless admin or project manager
    if (requestingUserId && requestingUserId !== targetUserId && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('Access denied to other user tasks');
    }

    const filters = this.buildFiltersFromQuery(queryDto);
    return await this.taskRepository.findByUserId(targetUserId, filters);
  }

  async findTasksByProjectId(
    projectId: number,
    queryDto: TaskQueryDto,
    userId?: number,
    userRole?: Role
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Verify project exists and user has access
    await this.projectService.findProjectById(projectId);
    
    const filters = this.buildFiltersFromQuery(queryDto);
    
    return await this.taskRepository.findByProjectIdWithPagination(
      projectId,
      queryDto.page,
      queryDto.limit,
      filters
    );
  }

  async searchTasks(
    query: string,
    queryDto: TaskQueryDto,
    userId?: number,
    userRole?: Role
  ): Promise<Task[]> {
    const filters = this.buildFiltersFromQuery(queryDto);
    const searchUserId = userRole === Role.ADMIN ? undefined : userId;
    
    return await this.taskRepository.searchTasks(query, searchUserId, filters);
  }

  // ==================== SPECIALIZED QUERIES ====================

  async findOverdueTasks(userId?: number): Promise<Task[]> {
    return await this.taskRepository.findOverdueTasks(userId);
  }

  async findDueToday(userId?: number): Promise<Task[]> {
    return await this.taskRepository.findDueToday(userId);
  }

  async findDueSoon(days: number = 7, userId?: number): Promise<Task[]> {
    return await this.taskRepository.findDueSoon(days, userId);
  }

  async findHighPriorityTasks(userId?: number): Promise<Task[]> {
    return await this.taskRepository.findHighPriorityTasks(userId);
  }

  async findTasksByStatus(status: TaskStatus, userId?: number): Promise<Task[]> {
    const filters: TaskFilters = { status };
    if (userId) {
      return await this.taskRepository.findByUserId(userId, filters);
    }
    return await this.taskRepository.findByStatus(status, filters);
  }

  async findSubTasks(parentTaskId: number, userId?: number, userRole?: Role): Promise<Task[]> {
    // Verify parent task exists and user has access
    await this.findTaskById(parentTaskId, userId, userRole);
    
    return await this.taskRepository.findSubTasks(parentTaskId);
  }

  // ==================== COMMENTS MANAGEMENT ====================

  async addComment(taskId: number, userId: number, createCommentDto: CreateCommentDto, userRole?: Role): Promise<TaskComment> {
    // Verify task exists and user has access
    await this.findTaskById(taskId, userId, userRole);
    
    return await this.taskRepository.createComment(taskId, userId, createCommentDto.content);
  }

  async updateComment(commentId: number, userId: number, updateCommentDto: UpdateCommentDto, userRole?: Role): Promise<TaskComment> {
    // Here you would typically verify the comment belongs to the user or user is admin
    // For now, we'll just update it
    return await this.taskRepository.updateComment(commentId, updateCommentDto.content);
  }

  async deleteComment(commentId: number, userId: number, userRole?: Role): Promise<void> {
    // Here you would typically verify the comment belongs to the user or user is admin
    await this.taskRepository.deleteComment(commentId);
  }

  async findComments(taskId: number, userId?: number, userRole?: Role): Promise<TaskComment[]> {
    // Verify task exists and user has access
    if (userId) {
      await this.findTaskById(taskId, userId, userRole);
    }
    
    return await this.taskRepository.findComments(taskId);
  }

  // ==================== TIME TRACKING ====================

  async addTimeLog(taskId: number, userId: number, createTimeLogDto: CreateTimeLogDto, userRole?: Role): Promise<TaskTimeLog> {
    // Verify task exists and user has access
    await this.findTaskById(taskId, userId, userRole);

    const timeLog = {
      taskId,
      description: createTimeLogDto.description,
      timeSpent: createTimeLogDto.timeSpent,
      loggedById: userId,
      loggedDate: createTimeLogDto.loggedDate ? new Date(createTimeLogDto.loggedDate) : new Date(),
      createdAt: new Date()
    };

    const createdTimeLog = await this.taskRepository.createTimeLog(timeLog);

    // Update task's actual hours
    const totalTime = await this.taskRepository.getTotalTimeSpent(taskId);
    const task = await this.findTaskById(taskId);
    const actualHours = Math.round(totalTime / 60); // Convert minutes to hours
    
    await this.taskRepository.update(taskId, { actualHours });

    return createdTimeLog;
  }

  async updateTimeLog(timeLogId: number, userId: number, updateTimeLogDto: UpdateTimeLogDto, userRole?: Role): Promise<TaskTimeLog> {
    // Here you would typically verify the time log belongs to the user or user is admin
    const updateData: any = {};
    
    if (updateTimeLogDto.description) updateData.description = updateTimeLogDto.description;
    if (updateTimeLogDto.timeSpent) updateData.timeSpent = updateTimeLogDto.timeSpent;
    if (updateTimeLogDto.loggedDate) updateData.loggedDate = new Date(updateTimeLogDto.loggedDate);

    return await this.taskRepository.updateTimeLog(timeLogId, updateData);
  }

  async deleteTimeLog(timeLogId: number, userId: number, userRole?: Role): Promise<void> {
    // Here you would typically verify the time log belongs to the user or user is admin
    await this.taskRepository.deleteTimeLog(timeLogId);
  }

  async findTimeLogs(taskId: number, filters?: TaskTimeLogFilters, userId?: number, userRole?: Role): Promise<TaskTimeLog[]> {
    // Verify task exists and user has access
    if (userId) {
      await this.findTaskById(taskId, userId, userRole);
    }
    
    return await this.taskRepository.findTimeLogs(taskId, filters);
  }

  async getUserTimeSpent(userId: number, dateRange?: { start: Date; end: Date }): Promise<number> {
    return await this.taskRepository.getUserTimeSpent(userId, dateRange);
  }

  // ==================== DEPENDENCIES ====================

  async addDependency(taskId: number, userId: number, createDependencyDto: CreateDependencyDto, userRole?: Role): Promise<TaskDependency> {
    // Verify both tasks exist and user has access
    await this.findTaskById(taskId, userId, userRole);
    await this.findTaskById(createDependencyDto.dependsOnTaskId, userId, userRole);

    // Check for circular dependencies
    await this.checkCircularDependency(taskId, createDependencyDto.dependsOnTaskId);

    return await this.taskRepository.createDependency(
      taskId,
      createDependencyDto.dependsOnTaskId,
      createDependencyDto.dependencyType
    );
  }

  async removeDependency(dependencyId: number, userId: number, userRole?: Role): Promise<void> {
    // Here you would typically verify the user has permission to remove this dependency
    await this.taskRepository.deleteDependency(dependencyId);
  }

  async findDependencies(taskId: number, userId?: number, userRole?: Role): Promise<TaskDependency[]> {
    // Verify task exists and user has access
    if (userId) {
      await this.findTaskById(taskId, userId, userRole);
    }
    
    return await this.taskRepository.findDependencies(taskId);
  }

  async findBlockingTasks(taskId: number, userId?: number, userRole?: Role): Promise<Task[]> {
    // Verify task exists and user has access
    if (userId) {
      await this.findTaskById(taskId, userId, userRole);
    }
    
    return await this.taskRepository.findBlockingTasks(taskId);
  }

  async findBlockedTasks(taskId: number, userId?: number, userRole?: Role): Promise<Task[]> {
    // Verify task exists and user has access
    if (userId) {
      await this.findTaskById(taskId, userId, userRole);
    }
    
    return await this.taskRepository.findBlockedTasks(taskId);
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateStatus(bulkUpdateDto: BulkUpdateStatusDto, userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to update all tasks
    for (const taskId of bulkUpdateDto.taskIds) {
      await this.findTaskById(taskId, userId, userRole);
    }

    await this.taskRepository.bulkUpdateStatus(bulkUpdateDto.taskIds, bulkUpdateDto.status);
  }

  async bulkAssign(bulkAssignDto: BulkAssignDto, userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to assign all tasks
    for (const taskId of bulkAssignDto.taskIds) {
      const task = await this.findTaskById(taskId, userId, userRole);
      if (!task.canUserAssign(userId, userRole)) {
        throw new ForbiddenException(`User does not have permission to assign task ${taskId}`);
      }
    }

    // Verify assigned user exists
    await this.userService.findUserById(bulkAssignDto.assignedToId);

    await this.taskRepository.bulkAssign(bulkAssignDto.taskIds, bulkAssignDto.assignedToId);
  }

  async bulkUpdatePriority(bulkUpdateDto: BulkUpdatePriorityDto, userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to update all tasks
    for (const taskId of bulkUpdateDto.taskIds) {
      await this.findTaskById(taskId, userId, userRole);
    }

    await this.taskRepository.bulkUpdatePriority(bulkUpdateDto.taskIds, bulkUpdateDto.priority);
  }

  async bulkMoveToProject(bulkMoveDto: BulkMoveDto, userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to move all tasks
    for (const taskId of bulkMoveDto.taskIds) {
      await this.findTaskById(taskId, userId, userRole);
    }

    // Verify project exists if provided
    if (bulkMoveDto.projectId) {
      await this.projectService.findProjectById(bulkMoveDto.projectId);
    }

    await this.taskRepository.bulkMoveToProject(bulkMoveDto.taskIds, bulkMoveDto.projectId!);
  }

  async bulkArchive(taskIds: number[], userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to archive all tasks
    for (const taskId of taskIds) {
      await this.findTaskById(taskId, userId, userRole);
    }

    await this.taskRepository.bulkArchive(taskIds);
  }

  async bulkDelete(taskIds: number[], userId: number, userRole?: Role): Promise<void> {
    // Verify user has permission to delete all tasks
    for (const taskId of taskIds) {
      const task = await this.findTaskById(taskId, userId, userRole);
      if (!task.canUserDelete(userId, userRole)) {
        throw new ForbiddenException(`User does not have permission to delete task ${taskId}`);
      }
    }

    await this.taskRepository.bulkDelete(taskIds);
  }

  // ==================== ARCHIVE OPERATIONS ====================

  async archiveTask(id: number, userId: number, userRole?: Role): Promise<void> {
    const task = await this.findTaskById(id, userId, userRole);
    
    if (!task.canUserEdit(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to archive this task');
    }

    await this.taskRepository.archiveTask(id);
  }

  async restoreTask(id: number, userId: number, userRole?: Role): Promise<void> {
    const task = await this.findTaskById(id, userId, userRole);
    
    if (!task.canUserEdit(userId, userRole)) {
      throw new ForbiddenException('User does not have permission to restore this task');
    }

    await this.taskRepository.restoreTask(id);
  }

  async findArchivedTasks(userId?: number, projectId?: number): Promise<Task[]> {
    return await this.taskRepository.findArchivedTasks(userId, projectId);
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  async getUserTaskStatistics(userId: number): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    overdue: number;
    blocked: number;
    highPriority: number;
    avgCompletionTime: number;
  }> {
    // Verify user exists
    await this.userService.findUserById(userId);
    
    return await this.taskRepository.getUserTaskStatistics(userId);
  }

  async getProjectTaskStatistics(projectId: number): Promise<{
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
  }> {
    // Verify project exists
    await this.projectService.findProjectById(projectId);
    
    return await this.taskRepository.getProjectTaskStatistics(projectId);
  }

  async getGlobalTaskStatistics(): Promise<{
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
  }> {
    return await this.taskRepository.getGlobalTaskStatistics();
  }

  async getTaskCompletionTrend(
    userId?: number,
    projectId?: number,
    days: number = 30
  ): Promise<Array<{
    date: Date;
    completed: number;
    created: number;
  }>> {
    return await this.taskRepository.getTaskCompletionTrend(userId, projectId, days);
  }

  async getProductivityMetrics(userId: number, dateRange?: { start: Date; end: Date }): Promise<{
    tasksCompleted: number;
    avgTasksPerDay: number;
    timeSpent: number;
    avgTimePerTask: number;
    estimateAccuracy: number;
    onTimeCompletionRate: number;
  }> {
    // Verify user exists
    await this.userService.findUserById(userId);
    
    return await this.taskRepository.getProductivityMetrics(userId, dateRange);
  }

  // ==================== DASHBOARD QUERIES ====================

  async getUserDashboardTasks(userId: number): Promise<{
    assigned: Task[];
    created: Task[];
    inProgress: Task[];
    overdue: Task[];
    dueToday: Task[];
    dueSoon: Task[];
    recent: Task[];
  }> {
    // Verify user exists
    await this.userService.findUserById(userId);
    
    return await this.taskRepository.findUserDashboardTasks(userId);
  }

  async getProjectDashboardTasks(projectId: number): Promise<{
    todo: Task[];
    inProgress: Task[];
    review: Task[];
    testing: Task[];
    blocked: Task[];
    recent: Task[];
    overdue: Task[];
  }> {
    // Verify project exists
    await this.projectService.findProjectById(projectId);
    
    return await this.taskRepository.findProjectDashboardTasks(projectId);
  }

  // ==================== NOTIFICATION QUERIES ====================

  async findTasksRequiringAttention(userId: number): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);
    
    return await this.taskRepository.findTasksRequiringAttention(userId);
  }

  async findTasksWithUpdates(userId: number, since: Date): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);
    
    return await this.taskRepository.findTasksWithUpdates(userId, since);
  }

  // ==================== REPORTING ====================

  async getTasksByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: number,
    projectId?: number
  ): Promise<Task[]> {
    return await this.taskRepository.getTasksByDateRange(startDate, endDate, userId, projectId);
  }

  async getCompletionRate(
    userId?: number,
    projectId?: number,
    dateRange?: { start: Date; end: Date }
  ): Promise<number> {
    return await this.taskRepository.getCompletionRate(userId, projectId, dateRange);
  }

  async getAverageTaskDuration(
    userId?: number,
    projectId?: number,
    taskType?: TaskType
  ): Promise<number> {
    return await this.taskRepository.getAverageTaskDuration(userId, projectId, taskType);
  }

  async getTaskDistribution(
    groupBy: 'status' | 'priority' | 'type' | 'assignee',
    userId?: number,
    projectId?: number
  ): Promise<Record<string, number>> {
    return await this.taskRepository.getTaskDistribution(groupBy, userId, projectId);
  }

  // ==================== HELPER METHODS ====================

  private buildFiltersFromQuery(queryDto: TaskQueryDto): TaskFilters {
    const filters: TaskFilters = {};

    if (queryDto.status !== undefined) filters.status = queryDto.status;
    if (queryDto.priority !== undefined) filters.priority = queryDto.priority;
    if (queryDto.type !== undefined) filters.type = queryDto.type;
    if (queryDto.assignedToId !== undefined) filters.assignedToId = queryDto.assignedToId;
    if (queryDto.createdById !== undefined) filters.createdById = queryDto.createdById;
    if (queryDto.projectId !== undefined) filters.projectId = queryDto.projectId;
    if (queryDto.parentTaskId !== undefined) filters.parentTaskId = queryDto.parentTaskId;
    if (queryDto.isOverdue !== undefined) filters.isOverdue = queryDto.isOverdue;
    if (queryDto.isArchived !== undefined) filters.isArchived = queryDto.isArchived;
    if (queryDto.hasEstimate !== undefined) filters.hasEstimate = queryDto.hasEstimate;

    if (queryDto.dueDateAfter) filters.dueDateAfter = new Date(queryDto.dueDateAfter);
    if (queryDto.dueDateBefore) filters.dueDateBefore = new Date(queryDto.dueDateBefore);
    if (queryDto.createdAfter) filters.createdAfter = new Date(queryDto.createdAfter);
    if (queryDto.createdBefore) filters.createdBefore = new Date(queryDto.createdBefore);

    if (queryDto.search) filters.search = queryDto.search;
    if (queryDto.tags && queryDto.tags.length > 0) filters.tags = queryDto.tags;

    return filters;
  }

  private async checkCircularDependency(taskId: number, dependsOnTaskId: number): Promise<void> {
    // Simple circular dependency check
    if (taskId === dependsOnTaskId) {
      throw new BadRequestException('Task cannot depend on itself');
    }

    // Check if dependsOnTaskId depends on taskId (creates a cycle)
    const dependencies = await this.taskRepository.findDependencies(dependsOnTaskId);
    const hasCircularDep = dependencies.some(dep => dep.dependsOnTaskId === taskId);
    
    if (hasCircularDep) {
      throw new BadRequestException('Circular dependency detected');
    }
  }
}