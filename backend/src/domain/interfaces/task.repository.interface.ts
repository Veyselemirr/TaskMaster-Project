import { Task } from '../entities/task.entity';
import { Priority } from '../entities/user.entity';

export interface TaskFilters {
  completed?: boolean;
  priority?: Priority;
  dueDateBefore?: Date;
  dueDateAfter?: Date;
  search?: string;
}

export interface ITaskRepository {
  findById(id: number): Promise<Task | null>;
  findByUserId(userId: number, filters?: TaskFilters): Promise<Task[]>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: number, task: Partial<Task>): Promise<Task>;
  delete(id: number): Promise<void>;
  findAll(
    page?: number,
    limit?: number,
    filters?: TaskFilters
  ): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  countByUserId(userId: number): Promise<{
    total: number;
    completed: number;
    pending: number;
  }>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');