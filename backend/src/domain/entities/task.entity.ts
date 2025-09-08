import { Priority } from './user.entity';

export class Task {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly completed: boolean,
    public readonly priority: Priority,
    public readonly dueDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userId: number
  ) {}

  static create(
    title: string,
    description: string | null,
    priority: Priority,
    dueDate: Date | null,
    userId: number
  ): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return new Task(
      0,
      title,
      description,
      false,
      priority,
      dueDate,
      new Date(),
      new Date(),
      userId
    );
  }

  markAsCompleted(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      true,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
      this.userId
    );
  }

  markAsIncomplete(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      false,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
      this.userId
    );
  }

  updateTask(
    title?: string,
    description?: string | null,
    priority?: Priority,
    dueDate?: Date | null
  ): Task {
    return new Task(
      this.id,
      title ?? this.title,
      description !== undefined ? description : this.description,
      this.completed,
      priority ?? this.priority,
      dueDate !== undefined ? dueDate : this.dueDate,
      this.createdAt,
      new Date(),
      this.userId
    );
  }

  isOverdue(): boolean {
    if (!this.dueDate || this.completed) return false;
    return this.dueDate < new Date();
  }

  isHighPriority(): boolean {
    return this.priority === Priority.HIGH;
  }
}