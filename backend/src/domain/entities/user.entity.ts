export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tasks?: Task[]
  ) {}

  static create(
    email: string,
    name: string | null,
    password: string
  ): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return new User(0, email, name, password, new Date(), new Date());
  }

  updateProfile(name: string | null): User {
    return new User(
      this.id,
      this.email,
      name,
      this.password,
      this.createdAt,
      new Date(),
      this.tasks
    );
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}