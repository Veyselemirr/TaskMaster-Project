import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ITaskRepository, TaskFilters } from '../../domain/interfaces/task.repository.interface';
import { TASK_REPOSITORY } from '../../domain/interfaces/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from '../dtos/task.dto';
import { UserService } from './user.service';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    private readonly userService: UserService
  ) {}

  async createTask(userId: number, createTaskDto: CreateTaskDto): Promise<Task> {
    // Verify user exists
    await this.userService.findUserById(userId);

    const taskData = Task.create(
      createTaskDto.title,
      createTaskDto.description || null,
      createTaskDto.priority,
      createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      userId
    );

    return await this.taskRepository.create(taskData);
  }

  async findTaskById(id: number, userId?: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If userId is provided, ensure the task belongs to the user
    if (userId !== undefined && task.userId !== userId) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async findTasksByUserId(
    userId: number,
    queryDto: TaskQueryDto
  ): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);

    const filters: TaskFilters = {
      completed: queryDto.completed,
      priority: queryDto.priority,
      search: queryDto.search,
      dueDateBefore: queryDto.dueDateBefore ? new Date(queryDto.dueDateBefore) : undefined,
      dueDateAfter: queryDto.dueDateAfter ? new Date(queryDto.dueDateAfter) : undefined
    };

    return await this.taskRepository.findByUserId(userId, filters);
  }

  async updateTask(id: number, userId: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.findTaskById(id, userId);

    const updateData: any = {};
    
    if (updateTaskDto.title !== undefined) {
      updateData.title = updateTaskDto.title;
    }
    if (updateTaskDto.description !== undefined) {
      updateData.description = updateTaskDto.description;
    }
    if (updateTaskDto.completed !== undefined) {
      updateData.completed = updateTaskDto.completed;
    }
    if (updateTaskDto.priority !== undefined) {
      updateData.priority = updateTaskDto.priority;
    }
    if (updateTaskDto.dueDate !== undefined) {
      updateData.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    return await this.taskRepository.update(id, updateData);
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    await this.findTaskById(id, userId); // Verify task exists and belongs to user
    await this.taskRepository.delete(id);
  }

  async markTaskAsCompleted(id: number, userId: number): Promise<Task> {
    const task = await this.findTaskById(id, userId);
    const completedTask = task.markAsCompleted();
    
    return await this.taskRepository.update(id, completedTask);
  }

  async markTaskAsIncomplete(id: number, userId: number): Promise<Task> {
    const task = await this.findTaskById(id, userId);
    const incompleteTask = task.markAsIncomplete();
    
    return await this.taskRepository.update(id, incompleteTask);
  }

  async getAllTasks(
    queryDto: TaskQueryDto
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const filters: TaskFilters = {
      completed: queryDto.completed,
      priority: queryDto.priority,
      search: queryDto.search,
      dueDateBefore: queryDto.dueDateBefore ? new Date(queryDto.dueDateBefore) : undefined,
      dueDateAfter: queryDto.dueDateAfter ? new Date(queryDto.dueDateAfter) : undefined
    };

    return await this.taskRepository.findAll(
      queryDto.page,
      queryDto.limit,
      filters
    );
  }

  async getUserTaskStatistics(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  }> {
    // Verify user exists
    await this.userService.findUserById(userId);

    const [basicStats, userTasks] = await Promise.all([
      this.taskRepository.countByUserId(userId),
      this.taskRepository.findByUserId(userId)
    ]);

    const overdue = userTasks.filter(task => task.isOverdue()).length;
    const highPriority = userTasks.filter(task => task.isHighPriority()).length;

    return {
      ...basicStats,
      overdue,
      highPriority
    };
  }

  async getOverdueTasks(userId: number): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);

    const userTasks = await this.taskRepository.findByUserId(userId, {
      completed: false
    });

    return userTasks.filter(task => task.isOverdue());
  }

  async getHighPriorityTasks(userId: number): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);

    return await this.taskRepository.findByUserId(userId, {
      priority: 'HIGH' as any,
      completed: false
    });
  }

  async getUpcomingTasks(userId: number, days: number = 7): Promise<Task[]> {
    // Verify user exists
    await this.userService.findUserById(userId);

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return await this.taskRepository.findByUserId(userId, {
      completed: false,
      dueDateAfter: now,
      dueDateBefore: futureDate
    });
  }
}