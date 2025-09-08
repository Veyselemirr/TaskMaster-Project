import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ITaskRepository, TaskFilters } from '../../domain/interfaces/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { Priority } from '../../domain/entities/user.entity';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id }
    });

    return task ? this.mapPrismaTaskToEntity(task) : null;
  }

  async findByUserId(userId: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition: any = { userId };

    if (filters) {
      if (filters.completed !== undefined) {
        whereCondition.completed = filters.completed;
      }
      if (filters.priority) {
        whereCondition.priority = filters.priority;
      }
      if (filters.dueDateBefore) {
        whereCondition.dueDate = {
          ...whereCondition.dueDate,
          lte: filters.dueDateBefore
        };
      }
      if (filters.dueDateAfter) {
        whereCondition.dueDate = {
          ...whereCondition.dueDate,
          gte: filters.dueDateAfter
        };
      }
      if (filters.search) {
        whereCondition.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: [
        { completed: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return tasks.map(task => this.mapPrismaTaskToEntity(task));
  }

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        userId: taskData.userId
      }
    });

    return this.mapPrismaTaskToEntity(task);
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const updateData: any = {};
    
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.completed !== undefined) updateData.completed = taskData.completed;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate;

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData
    });

    return this.mapPrismaTaskToEntity(task);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.task.delete({
      where: { id }
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: TaskFilters
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const whereCondition: any = {};

    if (filters) {
      if (filters.completed !== undefined) {
        whereCondition.completed = filters.completed;
      }
      if (filters.priority) {
        whereCondition.priority = filters.priority;
      }
      if (filters.dueDateBefore) {
        whereCondition.dueDate = {
          ...whereCondition.dueDate,
          lte: filters.dueDateBefore
        };
      }
      if (filters.dueDateAfter) {
        whereCondition.dueDate = {
          ...whereCondition.dueDate,
          gte: filters.dueDateAfter
        };
      }
      if (filters.search) {
        whereCondition.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: [
          { completed: 'asc' },
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      this.prisma.task.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasks.map(task => this.mapPrismaTaskToEntity(task)),
      total,
      page,
      totalPages
    };
  }

  async countByUserId(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } })
    ]);

    return {
      total,
      completed,
      pending: total - completed
    };
  }

  private mapPrismaTaskToEntity(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.completed,
      prismaTask.priority as Priority,
      prismaTask.dueDate,
      prismaTask.createdAt,
      prismaTask.updatedAt,
      prismaTask.userId
    );
  }
}