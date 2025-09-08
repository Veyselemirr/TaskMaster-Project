import { Injectable, Inject, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto, LoginDto, ChangePasswordDto } from '../dtos/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    
    const userData = User.create(
      createUserDto.email,
      createUserDto.name || null,
      hashedPassword
    );

    return await this.userRepository.create(userData);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findUserById(id);
    
    const updatedUser = existingUser.updateProfile(
      updateUserDto.name !== undefined ? updateUserDto.name : existingUser.name
    );

    return await this.userRepository.update(id, updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    await this.findUserById(id); // Check if user exists
    await this.userRepository.delete(id);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.userRepository.findAll(page, limit);
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.comparePasswords(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.findUserById(userId);
    
    const isCurrentPasswordValid = await this.comparePasswords(
      changePasswordDto.currentPassword,
      user.password
    );
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await this.hashPassword(changePasswordDto.newPassword);
    
    await this.userRepository.update(userId, {
      ...user,
      password: hashedNewPassword
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async getUserProfile(userId: number): Promise<{
    id: number;
    email: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasks?: any[];
  }> {
    const user = await this.findUserById(userId);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tasks: user.tasks
    };
  }
}