import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository, UserFilters } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Basic CRUD operations
  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { tasks: true }
    });

    return user ? this.mapPrismaUserToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tasks: true }
    });

    return user ? this.mapPrismaUserToEntity(user) : null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role as any,
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
        emailVerificationToken: userData.emailVerificationToken,
        passwordResetToken: userData.passwordResetToken,
        passwordResetExpires: userData.passwordResetExpires,
        tokenVersion: userData.tokenVersion,
        lastLoginAt: userData.lastLoginAt,
      },
      include: { tasks: true }
    });

    return this.mapPrismaUserToEntity(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.password !== undefined) updateData.password = userData.password;
    if (userData.role !== undefined) updateData.role = userData.role as any;
    if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
    if (userData.isEmailVerified !== undefined) updateData.isEmailVerified = userData.isEmailVerified;
    if (userData.emailVerificationToken !== undefined) updateData.emailVerificationToken = userData.emailVerificationToken;
    if (userData.passwordResetToken !== undefined) updateData.passwordResetToken = userData.passwordResetToken;
    if (userData.passwordResetExpires !== undefined) updateData.passwordResetExpires = userData.passwordResetExpires;
    if (userData.tokenVersion !== undefined) updateData.tokenVersion = userData.tokenVersion;
    if (userData.lastLoginAt !== undefined) updateData.lastLoginAt = userData.lastLoginAt;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { tasks: true }
    });

    return this.mapPrismaUserToEntity(user);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  // Advanced queries
  async findAll(page: number = 1, limit: number = 10, filters?: UserFilters): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const whereCondition = this.buildWhereCondition(filters);
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: { tasks: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapPrismaUserToEntity(user)),
      total,
      page,
      totalPages
    };
  }

  // Authentication related
  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
      include: { tasks: true }
    });

    return user ? this.mapPrismaUserToEntity(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      },
      include: { tasks: true }
    });

    return user ? this.mapPrismaUserToEntity(user) : null;
  }

  // Role and permission queries
  async findByRole(role: Role): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: role as any },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapPrismaUserToEntity(user));
  }

  async findActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapPrismaUserToEntity(user));
  }

  async findInactiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: false },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapPrismaUserToEntity(user));
  }

  async findUnverifiedUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isEmailVerified: false },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => this.mapPrismaUserToEntity(user));
  }

  // Statistics
  async countByRole(role: Role): Promise<number> {
    return await this.prisma.user.count({
      where: { role: role as any }
    });
  }

  async countActiveUsers(): Promise<number> {
    return await this.prisma.user.count({
      where: { isActive: true }
    });
  }

  async countTotalUsers(): Promise<number> {
    return await this.prisma.user.count();
  }

  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Record<Role, number>;
  }> {
    const [
      total,
      active,
      verified,
      adminCount,
      userCount,
      moderatorCount,
      projectManagerCount
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.user.count({ where: { role: Role.ADMIN as any } }),
      this.prisma.user.count({ where: { role: Role.USER as any } }),
      this.prisma.user.count({ where: { role: Role.MODERATOR as any } }),
      this.prisma.user.count({ where: { role: Role.PROJECT_MANAGER as any } })
    ]);

    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
      byRole: {
        [Role.ADMIN]: adminCount,
        [Role.USER]: userCount,
        [Role.MODERATOR]: moderatorCount,
        [Role.PROJECT_MANAGER]: projectManagerCount
      }
    };
  }

  // Bulk operations
  async bulkUpdateRole(userIds: number[], role: Role): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { 
        role: role as any,
        tokenVersion: { increment: 1 } // Invalidate existing tokens
      }
    });
  }

  async bulkActivate(userIds: number[]): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isActive: true }
    });
  }

  async bulkDeactivate(userIds: number[]): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { 
        isActive: false,
        tokenVersion: { increment: 1 } // Invalidate existing tokens
      }
    });
  }

  // Search and filter
  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const whereCondition = {
      OR: [
        { email: { contains: query, mode: 'insensitive' as any } },
        { name: { contains: query, mode: 'insensitive' as any } }
      ]
    };
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: { tasks: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapPrismaUserToEntity(user)),
      total,
      page,
      totalPages
    };
  }

  // Helper methods
  private buildWhereCondition(filters?: UserFilters): any {
    if (!filters) return {};

    const whereCondition: any = {};

    if (filters.role) {
      whereCondition.role = filters.role as any;
    }
    
    if (filters.isActive !== undefined) {
      whereCondition.isActive = filters.isActive;
    }
    
    if (filters.isEmailVerified !== undefined) {
      whereCondition.isEmailVerified = filters.isEmailVerified;
    }
    
    if (filters.search) {
      whereCondition.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters.createdAfter || filters.createdBefore) {
      whereCondition.createdAt = {};
      if (filters.createdAfter) {
        whereCondition.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        whereCondition.createdAt.lte = filters.createdBefore;
      }
    }
    
    if (filters.lastLoginAfter || filters.lastLoginBefore) {
      whereCondition.lastLoginAt = {};
      if (filters.lastLoginAfter) {
        whereCondition.lastLoginAt.gte = filters.lastLoginAfter;
      }
      if (filters.lastLoginBefore) {
        whereCondition.lastLoginAt.lte = filters.lastLoginBefore;
      }
    }

    return whereCondition;
  }

  private mapPrismaUserToEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.role,
      prismaUser.isActive,
      prismaUser.isEmailVerified,
      prismaUser.emailVerificationToken,
      prismaUser.passwordResetToken,
      prismaUser.passwordResetExpires,
      prismaUser.tokenVersion,
      prismaUser.lastLoginAt,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.tasks || []
    );
  }
}