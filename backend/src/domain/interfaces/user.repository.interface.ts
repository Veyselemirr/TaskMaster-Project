import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  findAll(page?: number, limit?: number): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');