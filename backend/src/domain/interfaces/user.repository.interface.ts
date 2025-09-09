import { User } from '../entities/user.entity';
import { Role } from '../../common/enums/role.enum';

export interface UserFilters {
  role?: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastLoginAfter?: Date;
  lastLoginBefore?: Date;
}

export interface IUserRepository {
  // Basic CRUD operations
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  
  // Advanced queries
  findAll(page?: number, limit?: number, filters?: UserFilters): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Authentication related
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findByPasswordResetToken(token: string): Promise<User | null>;
  
  // Role and permission queries
  findByRole(role: Role): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findInactiveUsers(): Promise<User[]>;
  findUnverifiedUsers(): Promise<User[]>;
  
  // Statistics
  countByRole(role: Role): Promise<number>;
  countActiveUsers(): Promise<number>;
  countTotalUsers(): Promise<number>;
  getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Record<Role, number>;
  }>;
  
  // Bulk operations
  bulkUpdateRole(userIds: number[], role: Role): Promise<void>;
  bulkActivate(userIds: number[]): Promise<void>;
  bulkDeactivate(userIds: number[]): Promise<void>;
  
  // Search and filter
  searchUsers(query: string, page?: number, limit?: number): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');