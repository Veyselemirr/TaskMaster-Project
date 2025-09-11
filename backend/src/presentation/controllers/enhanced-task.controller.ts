import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
  ValidationPipe,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EnhancedTaskService } from '../../application/services/enhanced-task.service';
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
  BulkMoveDto,
  TaskResponseDto,
  PaginatedTasksResponseDto,
  TaskSummaryDto,
  TaskStatisticsDto,
  UserTaskStatisticsDto,
  ProductivityMetricsDto,
  DashboardTasksDto,
  ProjectDashboardTasksDto,
  TaskCommentResponseDto,
  TaskTimeLogResponseDto,
  TaskDependencyResponseDto
} from '../../application/dtos/enhanced-task.dto';
import { Task, TaskStatus, TaskPriority, TaskType } from '../../domain/entities/enhanced-task.entity';

@ApiTags('Enhanced Tasks')
@Controller('enhanced-tasks')
@ApiBearerAuth()
export class EnhancedTaskController {
  constructor(private readonly taskService: EnhancedTaskService) {}

  // ==================== TASK CRUD OPERATIONS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new enhanced task' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Referenced user/project not found' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.createTask(req.user.id, createTaskDto);
    return this.mapTaskToResponse(task);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with full details' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.findTaskById(id, req.user.id, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task details' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.updateTask(id, req.user.id, updateTaskDto, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<void> {
    await this.taskService.deleteTask(id, req.user.id, req.user.role);
  }

  // ==================== TASK STATUS MANAGEMENT ====================

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task status updated successfully', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.updateTaskStatus(id, req.user.id, updateStatusDto, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start task (move to in-progress)' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task started successfully', type: TaskResponseDto })
  async startTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.startTask(id, req.user.id, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task completed successfully', type: TaskResponseDto })
  async completeTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.completeTask(id, req.user.id, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Block task with reason' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task blocked successfully', type: TaskResponseDto })
  async blockTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.blockTask(id, req.user.id, reason, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Unblock task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task unblocked successfully', type: TaskResponseDto })
  async unblockTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.unblockTask(id, req.user.id, req.user.role);
    return this.mapTaskToResponse(task);
  }

  // ==================== TASK ASSIGNMENT ====================

  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign task to user' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task assigned successfully', type: TaskResponseDto })
  async assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTaskDto: AssignTaskDto,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.assignTask(id, req.user.id, assignTaskDto, req.user.role);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/unassign')
  @ApiOperation({ summary: 'Unassign task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task unassigned successfully', type: TaskResponseDto })
  async unassignTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.unassignTask(id, req.user.id, req.user.role);
    return this.mapTaskToResponse(task);
  }

  // ==================== PROJECT MANAGEMENT ====================

  @Put(':id/move')
  @ApiOperation({ summary: 'Move task to different project or parent' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task moved successfully', type: TaskResponseDto })
  async moveTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() moveTaskDto: MoveTaskDto,
    @Request() req: any
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.moveTaskToProject(id, req.user.id, moveTaskDto, req.user.role);
    return this.mapTaskToResponse(task);
  }

  // ==================== TASK QUERIES ====================

  @Get()
  @ApiOperation({ summary: 'Get all tasks with advanced filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority })
  @ApiQuery({ name: 'type', required: false, enum: TaskType })
  @ApiQuery({ name: 'assignedToId', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully', type: PaginatedTasksResponseDto })
  async getAllTasks(
    @Query() queryDto: TaskQueryDto,
    @Request() req: any
  ): Promise<PaginatedTasksResponseDto> {
    const result = await this.taskService.getAllTasks(queryDto, req.user.id, req.user.role);
    
    return {
      tasks: result.tasks.map(task => this.mapTaskToResponse(task)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tasks for specific user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'User tasks retrieved successfully' })
  async getUserTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() queryDto: TaskQueryDto,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findTasksByUserId(
      userId, 
      queryDto, 
      req.user.id, 
      req.user.role
    );
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get tasks for specific project' })
  @ApiParam({ name: 'projectId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Project tasks retrieved successfully' })
  async getProjectTasks(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() queryDto: TaskQueryDto,
    @Request() req: any
  ): Promise<PaginatedTasksResponseDto> {
    const result = await this.taskService.findTasksByProjectId(
      projectId, 
      queryDto, 
      req.user.id, 
      req.user.role
    );
    
    return {
      tasks: result.tasks.map(task => this.mapTaskToResponse(task)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tasks by query' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'authentication' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchTasks(
    @Query('q') query: string,
    @Query() queryDto: TaskQueryDto,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.searchTasks(query, queryDto, req.user.id, req.user.role);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  // ==================== SPECIALIZED QUERIES ====================

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  @ApiResponse({ status: 200, description: 'Overdue tasks retrieved successfully' })
  async getOverdueTasks(@Request() req: any): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findOverdueTasks(req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('due-today')
  @ApiOperation({ summary: 'Get tasks due today' })
  @ApiResponse({ status: 200, description: 'Tasks due today retrieved successfully' })
  async getTasksDueToday(@Request() req: any): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findDueToday(req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('due-soon')
  @ApiOperation({ summary: 'Get tasks due soon' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({ status: 200, description: 'Tasks due soon retrieved successfully' })
  async getTasksDueSoon(
    @Query('days', ParseIntPipe) days: number = 7,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findDueSoon(days, req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('high-priority')
  @ApiOperation({ summary: 'Get high priority tasks' })
  @ApiResponse({ status: 200, description: 'High priority tasks retrieved successfully' })
  async getHighPriorityTasks(@Request() req: any): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findHighPriorityTasks(req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get tasks by status' })
  @ApiParam({ name: 'status', enum: TaskStatus, example: TaskStatus.IN_PROGRESS })
  @ApiResponse({ status: 200, description: 'Tasks by status retrieved successfully' })
  async getTasksByStatus(
    @Param('status') status: TaskStatus,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findTasksByStatus(status, req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get(':id/subtasks')
  @ApiOperation({ summary: 'Get subtasks of a task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Subtasks retrieved successfully' })
  async getSubTasks(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findSubTasks(id, req.user.id, req.user.role);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  // ==================== COMMENTS MANAGEMENT ====================

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get task comments' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully', type: [TaskCommentResponseDto] })
  async getTaskComments(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskCommentResponseDto[]> {
    const comments = await this.taskService.findComments(id, req.user.id, req.user.role);
    return comments.map(comment => this.mapCommentToResponse(comment));
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 201, description: 'Comment added successfully', type: TaskCommentResponseDto })
  async addTaskComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any
  ): Promise<TaskCommentResponseDto> {
    const comment = await this.taskService.addComment(id, req.user.id, createCommentDto, req.user.role);
    return this.mapCommentToResponse(comment);
  }

  @Put('comments/:commentId')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'commentId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: TaskCommentResponseDto })
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any
  ): Promise<TaskCommentResponseDto> {
    const comment = await this.taskService.updateComment(commentId, req.user.id, updateCommentDto, req.user.role);
    return this.mapCommentToResponse(comment);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'commentId', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() req: any
  ): Promise<void> {
    await this.taskService.deleteComment(commentId, req.user.id, req.user.role);
  }

  // ==================== TIME TRACKING ====================

  @Get(':id/time-logs')
  @ApiOperation({ summary: 'Get task time logs' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Time logs retrieved successfully', type: [TaskTimeLogResponseDto] })
  async getTaskTimeLogs(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskTimeLogResponseDto[]> {
    const timeLogs = await this.taskService.findTimeLogs(id, undefined, req.user.id, req.user.role);
    return timeLogs.map(log => this.mapTimeLogToResponse(log));
  }

  @Post(':id/time-logs')
  @ApiOperation({ summary: 'Add time log to task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 201, description: 'Time log added successfully', type: TaskTimeLogResponseDto })
  async addTimeLog(
    @Param('id', ParseIntPipe) id: number,
    @Body() createTimeLogDto: CreateTimeLogDto,
    @Request() req: any
  ): Promise<TaskTimeLogResponseDto> {
    const timeLog = await this.taskService.addTimeLog(id, req.user.id, createTimeLogDto, req.user.role);
    return this.mapTimeLogToResponse(timeLog);
  }

  @Put('time-logs/:timeLogId')
  @ApiOperation({ summary: 'Update time log' })
  @ApiParam({ name: 'timeLogId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Time log updated successfully', type: TaskTimeLogResponseDto })
  async updateTimeLog(
    @Param('timeLogId', ParseIntPipe) timeLogId: number,
    @Body() updateTimeLogDto: UpdateTimeLogDto,
    @Request() req: any
  ): Promise<TaskTimeLogResponseDto> {
    const timeLog = await this.taskService.updateTimeLog(timeLogId, req.user.id, updateTimeLogDto, req.user.role);
    return this.mapTimeLogToResponse(timeLog);
  }

  @Delete('time-logs/:timeLogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete time log' })
  @ApiParam({ name: 'timeLogId', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'Time log deleted successfully' })
  async deleteTimeLog(
    @Param('timeLogId', ParseIntPipe) timeLogId: number,
    @Request() req: any
  ): Promise<void> {
    await this.taskService.deleteTimeLog(timeLogId, req.user.id, req.user.role);
  }

  @Get('user/:userId/time-spent')
  @ApiOperation({ summary: 'Get user total time spent' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
  @ApiResponse({ status: 200, description: 'Time spent retrieved successfully' })
  async getUserTimeSpent(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<{ timeSpent: number }> {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate)
    } : undefined;

    const timeSpent = await this.taskService.getUserTimeSpent(userId, dateRange);
    return { timeSpent };
  }

  // ==================== DEPENDENCIES ====================

  @Get(':id/dependencies')
  @ApiOperation({ summary: 'Get task dependencies' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Dependencies retrieved successfully', type: [TaskDependencyResponseDto] })
  async getTaskDependencies(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskDependencyResponseDto[]> {
    const dependencies = await this.taskService.findDependencies(id, req.user.id, req.user.role);
    return dependencies.map(dep => this.mapDependencyToResponse(dep));
  }

  @Post(':id/dependencies')
  @ApiOperation({ summary: 'Add dependency to task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 201, description: 'Dependency added successfully', type: TaskDependencyResponseDto })
  async addDependency(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDependencyDto: CreateDependencyDto,
    @Request() req: any
  ): Promise<TaskDependencyResponseDto> {
    const dependency = await this.taskService.addDependency(id, req.user.id, createDependencyDto, req.user.role);
    return this.mapDependencyToResponse(dependency);
  }

  @Delete('dependencies/:dependencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove dependency' })
  @ApiParam({ name: 'dependencyId', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'Dependency removed successfully' })
  async removeDependency(
    @Param('dependencyId', ParseIntPipe) dependencyId: number,
    @Request() req: any
  ): Promise<void> {
    await this.taskService.removeDependency(dependencyId, req.user.id, req.user.role);
  }

  @Get(':id/blocking-tasks')
  @ApiOperation({ summary: 'Get tasks that block this task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Blocking tasks retrieved successfully' })
  async getBlockingTasks(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findBlockingTasks(id, req.user.id, req.user.role);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get(':id/blocked-tasks')
  @ApiOperation({ summary: 'Get tasks blocked by this task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Blocked tasks retrieved successfully' })
  async getBlockedTasks(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findBlockedTasks(id, req.user.id, req.user.role);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  // ==================== BULK OPERATIONS ====================

  @Put('bulk/status')
  @ApiOperation({ summary: 'Bulk update task status' })
  @ApiResponse({ status: 200, description: 'Tasks updated successfully' })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: BulkUpdateStatusDto,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkUpdateStatus(bulkUpdateDto, req.user.id, req.user.role);
    return { message: 'Tasks status updated successfully' };
  }

  @Put('bulk/assign')
  @ApiOperation({ summary: 'Bulk assign tasks' })
  @ApiResponse({ status: 200, description: 'Tasks assigned successfully' })
  async bulkAssign(
    @Body() bulkAssignDto: BulkAssignDto,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkAssign(bulkAssignDto, req.user.id, req.user.role);
    return { message: 'Tasks assigned successfully' };
  }

  @Put('bulk/priority')
  @ApiOperation({ summary: 'Bulk update task priority' })
  @ApiResponse({ status: 200, description: 'Tasks priority updated successfully' })
  async bulkUpdatePriority(
    @Body() bulkUpdateDto: BulkUpdatePriorityDto,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkUpdatePriority(bulkUpdateDto, req.user.id, req.user.role);
    return { message: 'Tasks priority updated successfully' };
  }

  @Put('bulk/move')
  @ApiOperation({ summary: 'Bulk move tasks to project' })
  @ApiResponse({ status: 200, description: 'Tasks moved successfully' })
  async bulkMoveToProject(
    @Body() bulkMoveDto: BulkMoveDto,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkMoveToProject(bulkMoveDto, req.user.id, req.user.role);
    return { message: 'Tasks moved successfully' };
  }

  @Put('bulk/archive')
  @ApiOperation({ summary: 'Bulk archive tasks' })
  @ApiResponse({ status: 200, description: 'Tasks archived successfully' })
  async bulkArchive(
    @Body('taskIds') taskIds: number[],
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkArchive(taskIds, req.user.id, req.user.role);
    return { message: 'Tasks archived successfully' };
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete tasks' })
  @ApiResponse({ status: 200, description: 'Tasks deleted successfully' })
  async bulkDelete(
    @Body('taskIds') taskIds: number[],
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.bulkDelete(taskIds, req.user.id, req.user.role);
    return { message: 'Tasks deleted successfully' };
  }

  // ==================== ARCHIVE OPERATIONS ====================

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task archived successfully' })
  async archiveTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.archiveTask(id, req.user.id, req.user.role);
    return { message: 'Task archived successfully' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore archived task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task restored successfully' })
  async restoreTask(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.taskService.restoreTask(id, req.user.id, req.user.role);
    return { message: 'Task restored successfully' };
  }

  @Get('archived')
  @ApiOperation({ summary: 'Get archived tasks' })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Archived tasks retrieved successfully' })
  async getArchivedTasks(
    @Query('projectId', ParseIntPipe) projectId?: number,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findArchivedTasks(req.user.id, projectId);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  @Get('user/:userId/statistics')
  @ApiOperation({ summary: 'Get user task statistics' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: UserTaskStatisticsDto })
  async getUserTaskStatistics(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<UserTaskStatisticsDto> {
    return await this.taskService.getUserTaskStatistics(userId);
  }

  @Get('project/:projectId/statistics')
  @ApiOperation({ summary: 'Get project task statistics' })
  @ApiParam({ name: 'projectId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: TaskStatisticsDto })
  async getProjectTaskStatistics(
    @Param('projectId', ParseIntPipe) projectId: number
  ): Promise<TaskStatisticsDto> {
    return await this.taskService.getProjectTaskStatistics(projectId);
  }

  @Get('statistics/global')
  @ApiOperation({ summary: 'Get global task statistics' })
  @ApiResponse({ status: 200, description: 'Global statistics retrieved successfully' })
  async getGlobalTaskStatistics(): Promise<any> {
    return await this.taskService.getGlobalTaskStatistics();
  }

  @Get('user/:userId/productivity')
  @ApiOperation({ summary: 'Get user productivity metrics' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Productivity metrics retrieved successfully', type: ProductivityMetricsDto })
  async getUserProductivityMetrics(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ProductivityMetricsDto> {
    const dateRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate)
    } : undefined;

    return await this.taskService.getProductivityMetrics(userId, dateRange);
  }

  @Get('trends/completion')
  @ApiOperation({ summary: 'Get task completion trend' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: Number })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({ status: 200, description: 'Completion trend retrieved successfully' })
  async getTaskCompletionTrend(
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('projectId', ParseIntPipe) projectId?: number,
    @Query('days', ParseIntPipe) days: number = 30
  ): Promise<Array<{
    date: Date;
    completed: number;
    created: number;
  }>> {
    return await this.taskService.getTaskCompletionTrend(userId, projectId, days);
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard/user')
  @ApiOperation({ summary: 'Get user dashboard tasks' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: DashboardTasksDto })
  async getUserDashboard(@Request() req: any): Promise<DashboardTasksDto> {
    const dashboardData = await this.taskService.getUserDashboardTasks(req.user.id);
    
    return {
      assigned: dashboardData.assigned.map(task => this.mapTaskToSummary(task)),
      created: dashboardData.created.map(task => this.mapTaskToSummary(task)),
      inProgress: dashboardData.inProgress.map(task => this.mapTaskToSummary(task)),
      overdue: dashboardData.overdue.map(task => this.mapTaskToSummary(task)),
      dueToday: dashboardData.dueToday.map(task => this.mapTaskToSummary(task)),
      dueSoon: dashboardData.dueSoon.map(task => this.mapTaskToSummary(task)),
      recent: dashboardData.recent.map(task => this.mapTaskToSummary(task))
    };
  }

  @Get('dashboard/project/:projectId')
  @ApiOperation({ summary: 'Get project dashboard tasks' })
  @ApiParam({ name: 'projectId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Project dashboard data retrieved successfully', type: ProjectDashboardTasksDto })
  async getProjectDashboard(
    @Param('projectId', ParseIntPipe) projectId: number
  ): Promise<ProjectDashboardTasksDto> {
    const dashboardData = await this.taskService.getProjectDashboardTasks(projectId);
    
    return {
      todo: dashboardData.todo.map(task => this.mapTaskToSummary(task)),
      inProgress: dashboardData.inProgress.map(task => this.mapTaskToSummary(task)),
      review: dashboardData.review.map(task => this.mapTaskToSummary(task)),
      testing: dashboardData.testing.map(task => this.mapTaskToSummary(task)),
      blocked: dashboardData.blocked.map(task => this.mapTaskToSummary(task)),
      recent: dashboardData.recent.map(task => this.mapTaskToSummary(task)),
      overdue: dashboardData.overdue.map(task => this.mapTaskToSummary(task))
    };
  }

  @Get('notifications/attention')
  @ApiOperation({ summary: 'Get tasks requiring attention' })
  @ApiResponse({ status: 200, description: 'Tasks requiring attention retrieved successfully' })
  async getTasksRequiringAttention(@Request() req: any): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findTasksRequiringAttention(req.user.id);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('notifications/updates')
  @ApiOperation({ summary: 'Get tasks with recent updates' })
  @ApiQuery({ name: 'since', required: false, type: String, example: '2024-01-01T00:00:00Z' })
  @ApiResponse({ status: 200, description: 'Tasks with updates retrieved successfully' })
  async getTasksWithUpdates(
    @Query('since') since?: string,
    @Request() req: any
  ): Promise<TaskResponseDto[]> {
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const tasks = await this.taskService.findTasksWithUpdates(req.user.id, sinceDate);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  // ==================== HELPER METHODS ====================

  private mapTaskToResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      startDate: task.startDate,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdById: task.createdById,
      assignedToId: task.assignedToId,
      projectId: task.projectId,
      parentTaskId: task.parentTaskId,
      isArchived: task.isArchived,
      tags: task.tags,
      customFields: task.customFields,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      
      // Relationships
      createdBy: task.createdBy ? {
        id: task.createdBy.id,
        email: task.createdBy.email,
        name: task.createdBy.name
      } : undefined,
      assignedTo: task.assignedTo ? {
        id: task.assignedTo.id,
        email: task.assignedTo.email,
        name: task.assignedTo.name
      } : undefined,
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
        status: task.project.status
      } : undefined,
      parentTask: task.parentTask ? this.mapTaskToResponse(task.parentTask) : undefined,
      subTasks: task.subTasks ? task.subTasks.map(subtask => this.mapTaskToResponse(subtask)) : undefined,
      comments: task.comments ? task.comments.map(comment => this.mapCommentToResponse(comment)) : undefined,
      attachments: task.attachments ? task.attachments.map(attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        uploadedById: attachment.uploadedById,
        createdAt: attachment.createdAt,
        uploadedBy: attachment.uploadedBy ? {
          id: attachment.uploadedBy.id,
          email: attachment.uploadedBy.email,
          name: attachment.uploadedBy.name
        } : undefined
      })) : undefined,
      timeLogs: task.timeLogs ? task.timeLogs.map(log => this.mapTimeLogToResponse(log)) : undefined,
      dependencies: task.dependencies ? task.dependencies.map(dep => this.mapDependencyToResponse(dep)) : undefined,
      
      // Computed fields
      isOverdue: task.isOverdue(),
      isDueToday: task.isDueToday(),
      isDueSoon: task.isDueSoon(),
      progress: task.getProgress(),
      subtaskProgress: task.getSubtaskProgress(),
      totalTimeSpent: task.getTimeSpent(),
      estimateAccuracy: task.getEstimateAccuracy()
    };
  }

  private mapTaskToSummary(task: Task): TaskSummaryDto {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      type: task.type,
      dueDate: task.dueDate,
      assignedToId: task.assignedToId,
      progress: task.getProgress(),
      isOverdue: task.isOverdue(),
      updatedAt: task.updatedAt
    };
  }

  private mapCommentToResponse(comment: any): TaskCommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author ? {
        id: comment.author.id,
        email: comment.author.email,
        name: comment.author.name
      } : undefined
    };
  }

  private mapTimeLogToResponse(timeLog: any): TaskTimeLogResponseDto {
    return {
      id: timeLog.id,
      description: timeLog.description,
      timeSpent: timeLog.timeSpent,
      loggedById: timeLog.loggedById,
      loggedDate: timeLog.loggedDate,
      createdAt: timeLog.createdAt,
      loggedBy: timeLog.loggedBy ? {
        id: timeLog.loggedBy.id,
        email: timeLog.loggedBy.email,
        name: timeLog.loggedBy.name
      } : undefined
    };
  }

  private mapDependencyToResponse(dependency: any): TaskDependencyResponseDto {
    return {
      id: dependency.id,
      taskId: dependency.taskId,
      dependsOnTaskId: dependency.dependsOnTaskId,
      dependencyType: dependency.dependencyType,
      createdAt: dependency.createdAt
    };
  }
}