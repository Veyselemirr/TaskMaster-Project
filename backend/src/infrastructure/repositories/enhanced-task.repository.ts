import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ITaskRepository, TaskFilters, TaskCommentFilters, TaskTimeLogFilters } from '../../domain/interfaces/enhanced-task.repository.interface';
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  TaskComment, 
  TaskAttachment, 
  TaskTimeLog, 
  TaskDependency,
  User,
  Project 
} from '../../domain/entities/enhanced-task.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class EnhancedTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== BASIC CRUD OPERATIONS ====================

  async findById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id }
    });

    return task ? this.mapPrismaTaskToEntity(task) : null;
  }

  async findByIdWithDetails(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        project: true,
        parentTask: true,
        subTasks: true,
        comments: {
          include: {
            author: true
          },
          orderBy: { createdAt: 'desc' }
        },
        attachments: {
          include: {
            uploadedBy: true
          }
        },
        timeLogs: {
          include: {
            loggedBy: true
          },
          orderBy: { loggedDate: 'desc' }
        },
        taskDependencies: true,
        dependentTasks: true
      }
    });

    return task ? this.mapPrismaTaskToEntityWithDetails(task) : null;
  }

  async create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        type: taskData.type,
        estimatedHours: taskData.estimatedHours,
        actualHours: taskData.actualHours,
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        completedAt: taskData.completedAt,
        createdById: taskData.createdById,
        assignedToId: taskData.assignedToId,
        projectId: taskData.projectId,
        parentTaskId: taskData.parentTaskId,
        isArchived: taskData.isArchived,
        tags: taskData.tags,
        customFields: taskData.customFields as any
      }
    });

    return this.mapPrismaTaskToEntity(task);
  }

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    const updateData: any = {};
    
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.type !== undefined) updateData.type = taskData.type;
    if (taskData.estimatedHours !== undefined) updateData.estimatedHours = taskData.estimatedHours;
    if (taskData.actualHours !== undefined) updateData.actualHours = taskData.actualHours;
    if (taskData.startDate !== undefined) updateData.startDate = taskData.startDate;
    if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate;
    if (taskData.completedAt !== undefined) updateData.completedAt = taskData.completedAt;
    if (taskData.assignedToId !== undefined) updateData.assignedToId = taskData.assignedToId;
    if (taskData.projectId !== undefined) updateData.projectId = taskData.projectId;
    if (taskData.parentTaskId !== undefined) updateData.parentTaskId = taskData.parentTaskId;
    if (taskData.isArchived !== undefined) updateData.isArchived = taskData.isArchived;
    if (taskData.tags !== undefined) updateData.tags = taskData.tags;
    if (taskData.customFields !== undefined) updateData.customFields = taskData.customFields as any;

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

  // ==================== ADVANCED QUERIES ====================

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
    const whereCondition = this.buildWhereCondition(filters);

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(),
        include: this.getBasicIncludes()
      }),
      this.prisma.task.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task)),
      total,
      page,
      totalPages
    };
  }

  // ==================== USER-BASED QUERIES ====================

  async findByUserId(userId: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ]
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findAssignedToUser(userId: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      assignedToId: userId
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findCreatedByUser(userId: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      createdById: userId
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // ==================== PROJECT-BASED QUERIES ====================

  async findByProjectId(projectId: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      projectId
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findByProjectIdWithPagination(
    projectId: number,
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
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      projectId
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: this.buildOrderBy(),
        include: this.getBasicIncludes()
      }),
      this.prisma.task.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task)),
      total,
      page,
      totalPages
    };
  }

  // ==================== STATUS-BASED QUERIES ====================

  async findByStatus(status: TaskStatus, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      status
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findInProgress(userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      status: TaskStatus.IN_PROGRESS
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findCompleted(userId?: number, dateRange?: { start: Date; end: Date }): Promise<Task[]> {
    const whereCondition: any = {
      status: TaskStatus.DONE
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (dateRange) {
      whereCondition.completedAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { completedAt: 'desc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findBlocked(userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      status: TaskStatus.BLOCKED
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // ==================== PRIORITY AND TIME-BASED QUERIES ====================

  async findByPriority(priority: TaskPriority, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition = {
      ...this.buildWhereCondition(filters),
      priority
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findHighPriorityTasks(userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      priority: {
        in: [TaskPriority.HIGH, TaskPriority.CRITICAL]
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ],
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findOverdueTasks(userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      dueDate: {
        lt: new Date()
      },
      status: {
        notIn: [TaskStatus.DONE, TaskStatus.CANCELLED]
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { dueDate: 'asc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findDueToday(userId?: number): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const whereCondition: any = {
      dueDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: {
        notIn: [TaskStatus.DONE, TaskStatus.CANCELLED]
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { dueDate: 'asc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findDueSoon(days: number, userId?: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const whereCondition: any = {
      dueDate: {
        gte: now,
        lte: futureDate
      },
      status: {
        notIn: [TaskStatus.DONE, TaskStatus.CANCELLED]
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { dueDate: 'asc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findUpcomingTasks(userId: number, days: number): Promise<Task[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const whereCondition = {
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ],
      dueDate: {
        gte: now,
        lte: futureDate
      },
      status: {
        notIn: [TaskStatus.DONE, TaskStatus.CANCELLED]
      }
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { dueDate: 'asc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // ==================== HIERARCHY AND DEPENDENCIES ====================

  async findSubTasks(parentTaskId: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { parentTaskId },
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findParentTasks(userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      parentTaskId: null
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findTasksByDepth(maxDepth: number): Promise<Task[]> {
    // This would require a recursive query or application-level logic
    // For now, return parent tasks and their immediate children
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { parentTaskId: null },
          {
            parentTask: {
              parentTaskId: null
            }
          }
        ]
      },
      include: {
        ...this.getBasicIncludes(),
        subTasks: {
          include: this.getBasicIncludes()
        }
      }
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // Dependencies
  async findDependencies(taskId: number): Promise<TaskDependency[]> {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: { taskId }
    });

    return dependencies.map(dep => this.mapPrismaTaskDependencyToEntity(dep));
  }

  async findBlockingTasks(taskId: number): Promise<Task[]> {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: {
        taskId,
        dependencyType: 'BLOCKS'
      },
      include: {
        dependsOnTask: {
          include: this.getBasicIncludes()
        }
      }
    });

    return dependencies
      .map(dep => dep.dependsOnTask)
      .map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findBlockedTasks(taskId: number): Promise<Task[]> {
    const dependencies = await this.prisma.taskDependency.findMany({
      where: {
        dependsOnTaskId: taskId,
        dependencyType: 'BLOCKS'
      },
      include: {
        task: {
          include: this.getBasicIncludes()
        }
      }
    });

    return dependencies
      .map(dep => dep.task)
      .map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async createDependency(taskId: number, dependsOnTaskId: number, type: string): Promise<TaskDependency> {
    const dependency = await this.prisma.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId,
        dependencyType: type
      }
    });

    return this.mapPrismaTaskDependencyToEntity(dependency);
  }

  async deleteDependency(dependencyId: number): Promise<void> {
    await this.prisma.taskDependency.delete({
      where: { id: dependencyId }
    });
  }

  // ==================== SEARCH AND FILTERING ====================

  async searchTasks(query: string, userId?: number, filters?: TaskFilters): Promise<Task[]> {
    const whereCondition: any = {
      ...this.buildWhereCondition(filters),
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (userId) {
      whereCondition.AND = {
        OR: [
          { createdById: userId },
          { assignedToId: userId }
        ]
      };
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findByTags(tags: string[], userId?: number): Promise<Task[]> {
    const whereCondition: any = {
      tags: {
        hasSome: tags
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findTasksWithEstimates(): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        estimatedHours: {
          not: null
        }
      },
      orderBy: this.buildOrderBy(),
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findTasksWithTimeVariance(threshold: number): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        AND: [
          { estimatedHours: { not: null } },
          { actualHours: { not: null } }
        ]
      },
      include: this.getBasicIncludes()
    });

    return tasks
      .map(task => this.mapPrismaTaskToEntityWithDetails(task))
      .filter(task => {
        if (!task.estimatedHours || !task.actualHours) return false;
        const variance = Math.abs(task.actualHours - task.estimatedHours) / task.estimatedHours;
        return variance > threshold;
      });
  }

  // ==================== COMMENTS MANAGEMENT ====================

  async findComments(taskId: number): Promise<TaskComment[]> {
    const comments = await this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return comments.map(comment => this.mapPrismaTaskCommentToEntity(comment));
  }

  async createComment(taskId: number, authorId: number, content: string): Promise<TaskComment> {
    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content
      },
      include: {
        author: true
      }
    });

    return this.mapPrismaTaskCommentToEntity(comment);
  }

  async updateComment(commentId: number, content: string): Promise<TaskComment> {
    const comment = await this.prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: true
      }
    });

    return this.mapPrismaTaskCommentToEntity(comment);
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.prisma.taskComment.delete({
      where: { id: commentId }
    });
  }

  // ==================== ATTACHMENTS MANAGEMENT ====================

  async findAttachments(taskId: number): Promise<TaskAttachment[]> {
    const attachments = await this.prisma.taskAttachment.findMany({
      where: { taskId },
      include: {
        uploadedBy: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return attachments.map(attachment => this.mapPrismaTaskAttachmentToEntity(attachment));
  }

  async createAttachment(taskId: number, attachment: Omit<TaskAttachment, 'id' | 'createdAt'>): Promise<TaskAttachment> {
    const createdAttachment = await this.prisma.taskAttachment.create({
      data: {
        taskId,
        filename: attachment.filename,
        originalName: attachment.originalName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        uploadedById: attachment.uploadedById
      },
      include: {
        uploadedBy: true
      }
    });

    return this.mapPrismaTaskAttachmentToEntity(createdAttachment);
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    await this.prisma.taskAttachment.delete({
      where: { id: attachmentId }
    });
  }

  // ==================== TIME TRACKING ====================

  async findTimeLogs(taskId: number, filters?: TaskTimeLogFilters): Promise<TaskTimeLog[]> {
    const whereCondition: any = { taskId };

    if (filters) {
      if (filters.loggedById) whereCondition.loggedById = filters.loggedById;
      if (filters.loggedDateAfter) whereCondition.loggedDate = { ...whereCondition.loggedDate, gte: filters.loggedDateAfter };
      if (filters.loggedDateBefore) whereCondition.loggedDate = { ...whereCondition.loggedDate, lte: filters.loggedDateBefore };
    }

    const timeLogs = await this.prisma.taskTimeLog.findMany({
      where: whereCondition,
      include: {
        loggedBy: true
      },
      orderBy: { loggedDate: 'desc' }
    });

    return timeLogs.map(log => this.mapPrismaTaskTimeLogToEntity(log));
  }

  async createTimeLog(timeLog: Omit<TaskTimeLog, 'id' | 'createdAt'>): Promise<TaskTimeLog> {
    const createdLog = await this.prisma.taskTimeLog.create({
      data: {
        taskId: timeLog.taskId,
        description: timeLog.description,
        timeSpent: timeLog.timeSpent,
        loggedById: timeLog.loggedById,
        loggedDate: timeLog.loggedDate
      },
      include: {
        loggedBy: true
      }
    });

    return this.mapPrismaTaskTimeLogToEntity(createdLog);
  }

  async updateTimeLog(timeLogId: number, timeLog: Partial<TaskTimeLog>): Promise<TaskTimeLog> {
    const updateData: any = {};
    
    if (timeLog.description !== undefined) updateData.description = timeLog.description;
    if (timeLog.timeSpent !== undefined) updateData.timeSpent = timeLog.timeSpent;
    if (timeLog.loggedDate !== undefined) updateData.loggedDate = timeLog.loggedDate;

    const updatedLog = await this.prisma.taskTimeLog.update({
      where: { id: timeLogId },
      data: updateData,
      include: {
        loggedBy: true
      }
    });

    return this.mapPrismaTaskTimeLogToEntity(updatedLog);
  }

  async deleteTimeLog(timeLogId: number): Promise<void> {
    await this.prisma.taskTimeLog.delete({
      where: { id: timeLogId }
    });
  }

  async getTotalTimeSpent(taskId: number): Promise<number> {
    const result = await this.prisma.taskTimeLog.aggregate({
      where: { taskId },
      _sum: { timeSpent: true }
    });

    return result._sum.timeSpent || 0;
  }

  async getUserTimeSpent(userId: number, dateRange?: { start: Date; end: Date }): Promise<number> {
    const whereCondition: any = { loggedById: userId };

    if (dateRange) {
      whereCondition.loggedDate = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const result = await this.prisma.taskTimeLog.aggregate({
      where: whereCondition,
      _sum: { timeSpent: true }
    });

    return result._sum.timeSpent || 0;
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
    const userCondition = {
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ]
    };

    const [
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked,
      highPriority
    ] = await Promise.all([
      this.prisma.task.count({ where: userCondition }),
      this.prisma.task.count({ where: { ...userCondition, status: TaskStatus.DONE } }),
      this.prisma.task.count({ where: { ...userCondition, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { ...userCondition, status: TaskStatus.TODO } }),
      this.prisma.task.count({
        where: {
          ...userCondition,
          dueDate: { lt: new Date() },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }
        }
      }),
      this.prisma.task.count({ where: { ...userCondition, status: TaskStatus.BLOCKED } }),
      this.prisma.task.count({
        where: {
          ...userCondition,
          priority: { in: [TaskPriority.HIGH, TaskPriority.CRITICAL] }
        }
      })
    ]);

    // Calculate average completion time
    const completedTasks = await this.prisma.task.findMany({
      where: {
        ...userCondition,
        status: TaskStatus.DONE,
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const days = Math.ceil(
          (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionTime = totalDays / completedTasks.length;
    }

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked,
      highPriority,
      avgCompletionTime
    };
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
    const projectCondition = { projectId };

    const [
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked
    ] = await Promise.all([
      this.prisma.task.count({ where: projectCondition }),
      this.prisma.task.count({ where: { ...projectCondition, status: TaskStatus.DONE } }),
      this.prisma.task.count({ where: { ...projectCondition, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { ...projectCondition, status: TaskStatus.TODO } }),
      this.prisma.task.count({
        where: {
          ...projectCondition,
          dueDate: { lt: new Date() },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }
        }
      }),
      this.prisma.task.count({ where: { ...projectCondition, status: TaskStatus.BLOCKED } })
    ]);

    // Get distribution by priority, status, and type
    const [priorityStats, statusStats, typeStats] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['priority'],
        where: projectCondition,
        _count: true
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        where: projectCondition,
        _count: true
      }),
      this.prisma.task.groupBy({
        by: ['type'],
        where: projectCondition,
        _count: true
      })
    ]);

    const byPriority = {} as Record<TaskPriority, number>;
    const byStatus = {} as Record<TaskStatus, number>;
    const byType = {} as Record<TaskType, number>;

    priorityStats.forEach(stat => {
      byPriority[stat.priority as TaskPriority] = stat._count;
    });

    statusStats.forEach(stat => {
      byStatus[stat.status as TaskStatus] = stat._count;
    });

    typeStats.forEach(stat => {
      byType[stat.type as TaskType] = stat._count;
    });

    // Calculate average completion time
    const completedTasks = await this.prisma.task.findMany({
      where: {
        ...projectCondition,
        status: TaskStatus.DONE,
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const days = Math.ceil(
          (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionTime = totalDays / completedTasks.length;
    }

    // Get total time spent
    const timeResult = await this.prisma.taskTimeLog.aggregate({
      where: {
        task: { projectId }
      },
      _sum: { timeSpent: true }
    });

    const totalTimeSpent = timeResult._sum.timeSpent || 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked,
      byPriority,
      byStatus,
      byType,
      avgCompletionTime,
      totalTimeSpent
    };
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
    const [
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked
    ] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: TaskStatus.DONE } }),
      this.prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { status: TaskStatus.TODO } }),
      this.prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }
        }
      }),
      this.prisma.task.count({ where: { status: TaskStatus.BLOCKED } })
    ]);

    // Get distribution by priority, status, and type
    const [priorityStats, statusStats, typeStats] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['priority'],
        _count: true
      }),
      this.prisma.task.groupBy({
        by: ['status'],
        _count: true
      }),
      this.prisma.task.groupBy({
        by: ['type'],
        _count: true
      })
    ]);

    const byPriority = {} as Record<TaskPriority, number>;
    const byStatus = {} as Record<TaskStatus, number>;
    const byType = {} as Record<TaskType, number>;

    priorityStats.forEach(stat => {
      byPriority[stat.priority as TaskPriority] = stat._count;
    });

    statusStats.forEach(stat => {
      byStatus[stat.status as TaskStatus] = stat._count;
    });

    typeStats.forEach(stat => {
      byType[stat.type as TaskType] = stat._count;
    });

    // Calculate average completion time
    const completedTasks = await this.prisma.task.findMany({
      where: {
        status: TaskStatus.DONE,
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const days = Math.ceil(
          (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionTime = totalDays / completedTasks.length;
    }

    // Get total time spent
    const timeResult = await this.prisma.taskTimeLog.aggregate({
      _sum: { timeSpent: true }
    });

    const totalTimeSpent = timeResult._sum.timeSpent || 0;

    // Get top performers
    const topPerformersStats = await this.prisma.task.groupBy({
      by: ['assignedToId'],
      where: {
        status: TaskStatus.DONE,
        assignedToId: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          assignedToId: 'desc'
        }
      },
      take: 10
    });

    const topPerformers = await Promise.all(
      topPerformersStats.map(async stat => {
        const userTasks = await this.prisma.task.findMany({
          where: {
            assignedToId: stat.assignedToId,
            status: TaskStatus.DONE,
            completedAt: { not: null }
          },
          select: {
            createdAt: true,
            completedAt: true
          }
        });

        let avgCompletionTime = 0;
        if (userTasks.length > 0) {
          const totalDays = userTasks.reduce((sum, task) => {
            const days = Math.ceil(
              (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0);
          avgCompletionTime = totalDays / userTasks.length;
        }

        return {
          userId: stat.assignedToId!,
          completedTasks: stat._count,
          avgCompletionTime
        };
      })
    );

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      blocked,
      byPriority,
      byStatus,
      byType,
      avgCompletionTime,
      totalTimeSpent,
      topPerformers
    };
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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereCondition: any = {
      createdAt: { gte: startDate }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      select: {
        createdAt: true,
        completedAt: true,
        status: true
      }
    });

    const trendData: Array<{ date: Date; completed: number; created: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const created = tasks.filter(task => 
        task.createdAt >= dayStart && task.createdAt <= dayEnd
      ).length;

      const completed = tasks.filter(task => 
        task.completedAt && 
        task.completedAt >= dayStart && 
        task.completedAt <= dayEnd
      ).length;

      trendData.push({
        date: dayStart,
        completed,
        created
      });
    }

    return trendData;
  }

  async getProductivityMetrics(userId: number, dateRange?: { start: Date; end: Date }): Promise<{
    tasksCompleted: number;
    avgTasksPerDay: number;
    timeSpent: number;
    avgTimePerTask: number;
    estimateAccuracy: number;
    onTimeCompletionRate: number;
  }> {
    const whereCondition: any = {
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ]
    };

    if (dateRange) {
      whereCondition.completedAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const completedTasks = await this.prisma.task.findMany({
      where: {
        ...whereCondition,
        status: TaskStatus.DONE
      },
      include: {
        timeLogs: true
      }
    });

    const tasksCompleted = completedTasks.length;

    // Calculate avg tasks per day
    const days = dateRange ? 
      Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) :
      30; // Default to 30 days
    const avgTasksPerDay = tasksCompleted / days;

    // Calculate total time spent
    const timeSpent = await this.getUserTimeSpent(userId, dateRange);

    // Calculate avg time per task
    const avgTimePerTask = tasksCompleted > 0 ? timeSpent / tasksCompleted : 0;

    // Calculate estimate accuracy
    const tasksWithEstimates = completedTasks.filter(task => task.estimatedHours && task.actualHours);
    let estimateAccuracy = 0;
    if (tasksWithEstimates.length > 0) {
      const totalAccuracy = tasksWithEstimates.reduce((sum, task) => {
        const accuracy = 1 - Math.abs(task.actualHours! - task.estimatedHours!) / task.estimatedHours!;
        return sum + Math.max(0, accuracy);
      }, 0);
      estimateAccuracy = (totalAccuracy / tasksWithEstimates.length) * 100;
    }

    // Calculate on-time completion rate
    const tasksWithDueDate = completedTasks.filter(task => task.dueDate && task.completedAt);
    let onTimeCompletionRate = 0;
    if (tasksWithDueDate.length > 0) {
      const onTimeTasks = tasksWithDueDate.filter(task => 
        task.completedAt! <= task.dueDate!
      ).length;
      onTimeCompletionRate = (onTimeTasks / tasksWithDueDate.length) * 100;
    }

    return {
      tasksCompleted,
      avgTasksPerDay,
      timeSpent,
      avgTimePerTask,
      estimateAccuracy,
      onTimeCompletionRate
    };
  }

  // ==================== DASHBOARD QUERIES ====================

  async findUserDashboardTasks(userId: number): Promise<{
    assigned: Task[];
    created: Task[];
    inProgress: Task[];
    overdue: Task[];
    dueToday: Task[];
    dueSoon: Task[];
    recent: Task[];
  }> {
    const [assigned, created, inProgress, overdue, dueToday, dueSoon, recent] = await Promise.all([
      this.findAssignedToUser(userId, { isArchived: false }),
      this.findCreatedByUser(userId, { isArchived: false }),
      this.findInProgress(userId),
      this.findOverdueTasks(userId),
      this.findDueToday(userId),
      this.findDueSoon(7, userId),
      this.findByUserId(userId, { isArchived: false })
    ]);

    return {
      assigned: assigned.slice(0, 10),
      created: created.slice(0, 10),
      inProgress: inProgress.slice(0, 10),
      overdue: overdue.slice(0, 10),
      dueToday: dueToday.slice(0, 10),
      dueSoon: dueSoon.slice(0, 10),
      recent: recent.slice(0, 10)
    };
  }

  async findProjectDashboardTasks(projectId: number): Promise<{
    todo: Task[];
    inProgress: Task[];
    review: Task[];
    testing: Task[];
    blocked: Task[];
    recent: Task[];
    overdue: Task[];
  }> {
    const [todo, inProgress, review, testing, blocked, recent, overdue] = await Promise.all([
      this.findByProjectId(projectId, { status: TaskStatus.TODO, isArchived: false }),
      this.findByProjectId(projectId, { status: TaskStatus.IN_PROGRESS, isArchived: false }),
      this.findByProjectId(projectId, { status: TaskStatus.REVIEW, isArchived: false }),
      this.findByProjectId(projectId, { status: TaskStatus.TESTING, isArchived: false }),
      this.findByProjectId(projectId, { status: TaskStatus.BLOCKED, isArchived: false }),
      this.findByProjectId(projectId, { isArchived: false }),
      this.findByProjectId(projectId, { isOverdue: true, isArchived: false })
    ]);

    return {
      todo: todo.slice(0, 10),
      inProgress: inProgress.slice(0, 10),
      review: review.slice(0, 10),
      testing: testing.slice(0, 10),
      blocked: blocked.slice(0, 10),
      recent: recent.slice(0, 10),
      overdue: overdue.slice(0, 10)
    };
  }

  // ==================== BULK OPERATIONS ====================

  async bulkUpdateStatus(taskIds: number[], status: TaskStatus): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { status }
    });
  }

  async bulkAssign(taskIds: number[], assignedToId: number): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { assignedToId }
    });
  }

  async bulkUpdatePriority(taskIds: number[], priority: TaskPriority): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { priority }
    });
  }

  async bulkMoveToProject(taskIds: number[], projectId: number): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { projectId }
    });
  }

  async bulkArchive(taskIds: number[]): Promise<void> {
    await this.prisma.task.updateMany({
      where: {
        id: { in: taskIds }
      },
      data: { isArchived: true }
    });
  }

  async bulkDelete(taskIds: number[]): Promise<void> {
    await this.prisma.task.deleteMany({
      where: {
        id: { in: taskIds }
      }
    });
  }

  // ==================== ARCHIVE OPERATIONS ====================

  async archiveTask(id: number): Promise<void> {
    await this.prisma.task.update({
      where: { id },
      data: { isArchived: true }
    });
  }

  async restoreTask(id: number): Promise<void> {
    await this.prisma.task.update({
      where: { id },
      data: { isArchived: false }
    });
  }

  async findArchivedTasks(userId?: number, projectId?: number): Promise<Task[]> {
    const whereCondition: any = {
      isArchived: true
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { updatedAt: 'desc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // ==================== NOTIFICATION QUERIES ====================

  async findTasksRequiringAttention(userId: number): Promise<Task[]> {
    const whereCondition = {
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ],
      AND: {
        OR: [
          { status: TaskStatus.BLOCKED },
          {
            dueDate: { lt: new Date() },
            status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }
          },
          {
            priority: { in: [TaskPriority.HIGH, TaskPriority.CRITICAL] },
            status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }
          }
        ]
      }
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ],
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findTasksWithUpdates(userId: number, since: Date): Promise<Task[]> {
    const whereCondition = {
      OR: [
        { createdById: userId },
        { assignedToId: userId }
      ],
      updatedAt: { gte: since }
    };

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { updatedAt: 'desc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async findMentionedTasks(userId: number): Promise<Task[]> {
    // This would require a more complex implementation to search for mentions in comments
    // For now, return tasks where user is mentioned in comments
    const tasks = await this.prisma.task.findMany({
      where: {
        comments: {
          some: {
            content: {
              contains: `@${userId}`, // Simplified mention detection
              mode: 'insensitive'
            }
          }
        }
      },
      include: this.getBasicIncludes(),
      orderBy: { updatedAt: 'desc' }
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  // ==================== REPORTING QUERIES ====================

  async getTasksByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: number,
    projectId?: number
  ): Promise<Task[]> {
    const whereCondition: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: this.getBasicIncludes()
    });

    return tasks.map(task => this.mapPrismaTaskToEntityWithDetails(task));
  }

  async getCompletionRate(
    userId?: number,
    projectId?: number,
    dateRange?: { start: Date; end: Date }
  ): Promise<number> {
    const whereCondition: any = {};

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    if (dateRange) {
      whereCondition.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end
      };
    }

    const [total, completed] = await Promise.all([
      this.prisma.task.count({ where: whereCondition }),
      this.prisma.task.count({ 
        where: { 
          ...whereCondition, 
          status: TaskStatus.DONE 
        } 
      })
    ]);

    return total > 0 ? (completed / total) * 100 : 0;
  }

  async getAverageTaskDuration(
    userId?: number,
    projectId?: number,
    taskType?: TaskType
  ): Promise<number> {
    const whereCondition: any = {
      status: TaskStatus.DONE,
      completedAt: { not: null }
    };

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    if (taskType) {
      whereCondition.type = taskType;
    }

    const tasks = await this.prisma.task.findMany({
      where: whereCondition,
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    if (tasks.length === 0) return 0;

    const totalDays = tasks.reduce((sum, task) => {
      const days = Math.ceil(
        (task.completedAt!.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);

    return totalDays / tasks.length;
  }

  async getTaskDistribution(
    groupBy: 'status' | 'priority' | 'type' | 'assignee',
    userId?: number,
    projectId?: number
  ): Promise<Record<string, number>> {
    const whereCondition: any = {};

    if (userId) {
      whereCondition.OR = [
        { createdById: userId },
        { assignedToId: userId }
      ];
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    let groupByField: string;
    switch (groupBy) {
      case 'status':
        groupByField = 'status';
        break;
      case 'priority':
        groupByField = 'priority';
        break;
      case 'type':
        groupByField = 'type';
        break;
      case 'assignee':
        groupByField = 'assignedToId';
        break;
      default:
        groupByField = 'status';
    }

    const results = await this.prisma.task.groupBy({
      by: [groupByField as any],
      where: whereCondition,
      _count: true
    });

    const distribution: Record<string, number> = {};
    results.forEach((result: any) => {
      const key = result[groupByField]?.toString() || 'null';
      distribution[key] = result._count;
    });

    return distribution;
  }

  // ==================== HELPER METHODS ====================

  private buildWhereCondition(filters?: TaskFilters): any {
    const whereCondition: any = {};

    if (!filters) return whereCondition;

    if (filters.status !== undefined) whereCondition.status = filters.status;
    if (filters.priority !== undefined) whereCondition.priority = filters.priority;
    if (filters.type !== undefined) whereCondition.type = filters.type;
    if (filters.assignedToId !== undefined) whereCondition.assignedToId = filters.assignedToId;
    if (filters.createdById !== undefined) whereCondition.createdById = filters.createdById;
    if (filters.projectId !== undefined) whereCondition.projectId = filters.projectId;
    if (filters.parentTaskId !== undefined) whereCondition.parentTaskId = filters.parentTaskId;
    if (filters.isArchived !== undefined) whereCondition.isArchived = filters.isArchived;

    if (filters.dueDateAfter || filters.dueDateBefore) {
      whereCondition.dueDate = {};
      if (filters.dueDateAfter) whereCondition.dueDate.gte = filters.dueDateAfter;
      if (filters.dueDateBefore) whereCondition.dueDate.lte = filters.dueDateBefore;
    }

    if (filters.createdAfter || filters.createdBefore) {
      whereCondition.createdAt = {};
      if (filters.createdAfter) whereCondition.createdAt.gte = filters.createdAfter;
      if (filters.createdBefore) whereCondition.createdAt.lte = filters.createdBefore;
    }

    if (filters.completedAfter || filters.completedBefore) {
      whereCondition.completedAt = {};
      if (filters.completedAfter) whereCondition.completedAt.gte = filters.completedAfter;
      if (filters.completedBefore) whereCondition.completedAt.lte = filters.completedBefore;
    }

    if (filters.hasEstimate !== undefined) {
      whereCondition.estimatedHours = filters.hasEstimate ? { not: null } : null;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereCondition.tags = { hasSome: filters.tags };
    }

    if (filters.search) {
      whereCondition.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.isOverdue) {
      whereCondition.dueDate = { lt: new Date() };
      whereCondition.status = { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] };
    }

    return whereCondition;
  }

  private buildOrderBy(): any {
    return [
      { isArchived: 'asc' },
      { status: 'asc' },
      { priority: 'desc' },
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ];
  }

  private getBasicIncludes(): any {
    return {
      createdBy: true,
      assignedTo: true,
      project: true,
      parentTask: true
    };
  }

  private mapPrismaTaskToEntity(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority as TaskPriority,
      prismaTask.type as TaskType,
      prismaTask.estimatedHours,
      prismaTask.actualHours,
      prismaTask.startDate,
      prismaTask.dueDate,
      prismaTask.completedAt,
      prismaTask.createdById,
      prismaTask.assignedToId,
      prismaTask.projectId,
      prismaTask.parentTaskId,
      prismaTask.isArchived,
      prismaTask.tags,
      prismaTask.customFields,
      prismaTask.createdAt,
      prismaTask.updatedAt
    );
  }

  private mapPrismaTaskToEntityWithDetails(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority as TaskPriority,
      prismaTask.type as TaskType,
      prismaTask.estimatedHours,
      prismaTask.actualHours,
      prismaTask.startDate,
      prismaTask.dueDate,
      prismaTask.completedAt,
      prismaTask.createdById,
      prismaTask.assignedToId,
      prismaTask.projectId,
      prismaTask.parentTaskId,
      prismaTask.isArchived,
      prismaTask.tags,
      prismaTask.customFields,
      prismaTask.createdAt,
      prismaTask.updatedAt,
      // Relationships
      prismaTask.createdBy ? this.mapPrismaUserToEntity(prismaTask.createdBy) : undefined,
      prismaTask.assignedTo ? this.mapPrismaUserToEntity(prismaTask.assignedTo) : undefined,
      prismaTask.project ? this.mapPrismaProjectToEntity(prismaTask.project) : undefined,
      prismaTask.parentTask ? this.mapPrismaTaskToEntity(prismaTask.parentTask) : undefined,
      prismaTask.subTasks ? prismaTask.subTasks.map((task: any) => this.mapPrismaTaskToEntity(task)) : undefined,
      prismaTask.comments ? prismaTask.comments.map((comment: any) => this.mapPrismaTaskCommentToEntity(comment)) : undefined,
      prismaTask.attachments ? prismaTask.attachments.map((attachment: any) => this.mapPrismaTaskAttachmentToEntity(attachment)) : undefined,
      prismaTask.timeLogs ? prismaTask.timeLogs.map((log: any) => this.mapPrismaTaskTimeLogToEntity(log)) : undefined,
      prismaTask.taskDependencies ? prismaTask.taskDependencies.map((dep: any) => this.mapPrismaTaskDependencyToEntity(dep)) : undefined
    );
  }

  private mapPrismaUserToEntity(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role as Role
    };
  }

  private mapPrismaProjectToEntity(prismaProject: any): Project {
    return {
      id: prismaProject.id,
      name: prismaProject.name,
      status: prismaProject.status
    };
  }

  private mapPrismaTaskCommentToEntity(prismaComment: any): TaskComment {
    return {
      id: prismaComment.id,
      content: prismaComment.content,
      authorId: prismaComment.authorId,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt,
      author: prismaComment.author ? this.mapPrismaUserToEntity(prismaComment.author) : undefined
    };
  }

  private mapPrismaTaskAttachmentToEntity(prismaAttachment: any): TaskAttachment {
    return {
      id: prismaAttachment.id,
      filename: prismaAttachment.filename,
      originalName: prismaAttachment.originalName,
      fileSize: prismaAttachment.fileSize,
      mimeType: prismaAttachment.mimeType,
      uploadedById: prismaAttachment.uploadedById,
      createdAt: prismaAttachment.createdAt,
      uploadedBy: prismaAttachment.uploadedBy ? this.mapPrismaUserToEntity(prismaAttachment.uploadedBy) : undefined
    };
  }

  private mapPrismaTaskTimeLogToEntity(prismaTimeLog: any): TaskTimeLog {
    return {
      id: prismaTimeLog.id,
      description: prismaTimeLog.description,
      timeSpent: prismaTimeLog.timeSpent,
      loggedById: prismaTimeLog.loggedById,
      loggedDate: prismaTimeLog.loggedDate,
      createdAt: prismaTimeLog.createdAt,
      loggedBy: prismaTimeLog.loggedBy ? this.mapPrismaUserToEntity(prismaTimeLog.loggedBy) : undefined
    };
  }

  private mapPrismaTaskDependencyToEntity(prismaDependency: any): TaskDependency {
    return {
      id: prismaDependency.id,
      taskId: prismaDependency.taskId,
      dependsOnTaskId: prismaDependency.dependsOnTaskId,
      dependencyType: prismaDependency.dependencyType,
      createdAt: prismaDependency.createdAt
    };
  }
}