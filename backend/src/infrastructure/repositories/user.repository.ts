import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        password: userData.password
      },
      include: { tasks: true }
    });

    return this.mapPrismaUserToEntity(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(userData.email && { email: userData.email }),
        ...(userData.name !== undefined && { name: userData.name }),
        ...(userData.password && { password: userData.password })
      },
      include: { tasks: true }
    });

    return this.mapPrismaUserToEntity(user);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { tasks: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapPrismaUserToEntity(user)),
      total,
      page,
      totalPages
    };
  }

  private mapPrismaUserToEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.tasks || []
    );
  }
}