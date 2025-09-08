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
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TaskService } from '../../application/services/task.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponseDto,
  TaskQueryDto,
  TaskStatsDto
} from '../../application/dtos/task.dto';
import { Task } from '../../domain/entities/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('user/:userId')
  @ApiOperation({ summary: 'Create a new task for user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createTask(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.createTask(userId, createTaskDto);
    return this.mapTaskToResponse(task);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getAllTasks(@Query() queryDto: TaskQueryDto): Promise<{
    tasks: TaskResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const result = await this.taskService.getAllTasks(queryDto);
    
    return {
      tasks: result.tasks.map(task => this.mapTaskToResponse(task)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get tasks for a specific user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH'] })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'User tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() queryDto: TaskQueryDto
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.findTasksByUserId(userId, queryDto);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskById(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    const task = await this.taskService.findTaskById(id);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/user/:userId')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.updateTask(id, userId, updateTaskDto);
    return this.mapTaskToResponse(task);
  }

  @Delete(':id/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<void> {
    await this.taskService.deleteTask(id, userId);
  }

  @Put(':id/complete/user/:userId')
  @ApiOperation({ summary: 'Mark task as completed' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task marked as completed', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async markTaskAsCompleted(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.markTaskAsCompleted(id, userId);
    return this.mapTaskToResponse(task);
  }

  @Put(':id/incomplete/user/:userId')
  @ApiOperation({ summary: 'Mark task as incomplete' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Task marked as incomplete', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this task' })
  async markTaskAsIncomplete(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<TaskResponseDto> {
    const task = await this.taskService.markTaskAsIncomplete(id, userId);
    return this.mapTaskToResponse(task);
  }

  @Get('user/:userId/statistics')
  @ApiOperation({ summary: 'Get user task statistics' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: TaskStatsDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTaskStatistics(
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  }> {
    return await this.taskService.getUserTaskStatistics(userId);
  }

  @Get('user/:userId/overdue')
  @ApiOperation({ summary: 'Get overdue tasks for user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'Overdue tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getOverdueTasks(@Param('userId', ParseIntPipe) userId: number): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.getOverdueTasks(userId);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('user/:userId/high-priority')
  @ApiOperation({ summary: 'Get high priority tasks for user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'High priority tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getHighPriorityTasks(@Param('userId', ParseIntPipe) userId: number): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.getHighPriorityTasks(userId);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  @Get('user/:userId/upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks for user' })
  @ApiParam({ name: 'userId', type: 'number', example: 1 })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  @ApiResponse({ status: 200, description: 'Upcoming tasks retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUpcomingTasks(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('days', ParseIntPipe) days: number = 7
  ): Promise<TaskResponseDto[]> {
    const tasks = await this.taskService.getUpcomingTasks(userId, days);
    return tasks.map(task => this.mapTaskToResponse(task));
  }

  private mapTaskToResponse(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.userId
    };
  }
}