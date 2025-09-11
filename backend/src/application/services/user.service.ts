import { 
  Injectable, 
  Inject, 
  ConflictException, 
  NotFoundException, 
  UnauthorizedException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import type { IUserRepository, UserFilters } from '../../domain/interfaces/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { Role, Permission, ROLE_PERMISSIONS } from '../../common/enums/role.enum';
import { ConfigService } from '../../common/config/config.service';
import { JwtPayload, AuthUser, LoginResponse } from '../../common/types/auth.types';

import {
  RegisterDto,
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  UserQueryDto,
  BulkUpdateRoleDto,
  BulkUpdateStatusDto,
  UserResponseDto,
  LoginResponseDto,
  UserStatisticsDto,
  PaginatedUsersResponseDto
} from '../dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  // Authentication methods
  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const emailVerificationToken = this.generateToken();
    
    const userData = User.create(
      registerDto.email,
      registerDto.name || null,
      hashedPassword,
      registerDto.role || Role.USER
    );

    // Add verification token - userData is Omit<User> so cast it
    const userWithToken = new User(
      0, // id will be set by database
      userData.email,
      userData.name,
      userData.password,
      userData.role,
      userData.isActive,
      false, // Email not verified initially
      emailVerificationToken,
      userData.passwordResetToken,
      userData.passwordResetExpires,
      userData.tokenVersion,
      userData.lastLoginAt,
      new Date(), // createdAt
      new Date(), // updatedAt
      userData.tasks
    );

    const createdUser = await this.userRepository.create(userWithToken);
    
    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(createdUser.email, emailVerificationToken);
    
    return createdUser;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUserCredentials(loginDto);
    
    if (!user.canLogin()) {
      throw new ForbiddenException('Account is not active or email is not verified');
    }

    // Update last login
    const updatedUser = user.updateLastLogin();
    await this.userRepository.update(user.id, updatedUser);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(updatedUser)
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.jwt.refreshSecret,
      });

      const user = await this.findUserById(payload.sub);
      
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(forgotPasswordDto.email);
    
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = this.generateToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    const userWithResetToken = user.setPasswordResetToken(resetToken, resetExpires);
    await this.userRepository.update(user.id, userWithResetToken);

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findByPasswordResetToken(resetPasswordDto.token);
    
    if (!user || !user.isPasswordResetTokenValid()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(resetPasswordDto.newPassword);
    const updatedUser = user.updatePassword(hashedPassword);
    
    await this.userRepository.update(user.id, updatedUser);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void> {
    const user = await this.userRepository.findByEmailVerificationToken(verifyEmailDto.token);
    
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    const verifiedUser = user.verifyEmail();
    await this.userRepository.update(user.id, verifiedUser);
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
    const updatedUser = user.updatePassword(hashedNewPassword);
    
    await this.userRepository.update(userId, updatedUser);
  }

  // User management methods
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    
    const userData = User.create(
      createUserDto.email,
      createUserDto.name || null,
      hashedPassword,
      createUserDto.role || Role.USER
    );

    // Set initial status - userData is Omit<User> so use proper values
    const userWithStatus = new User(
      0, // id will be set by database
      userData.email,
      userData.name,
      userData.password,
      userData.role,
      createUserDto.isActive ?? true,
      createUserDto.isEmailVerified ?? false,
      userData.emailVerificationToken,
      userData.passwordResetToken,
      userData.passwordResetExpires,
      userData.tokenVersion,
      userData.lastLoginAt,
      new Date(), // createdAt
      new Date(), // updatedAt
      userData.tasks
    );

    return await this.userRepository.create(userWithStatus);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findUserById(id);
    
    // Check if email is already taken by another user
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (emailUser && emailUser.id !== id) {
        throw new ConflictException('Email is already taken');
      }
    }

    const updatedUser = existingUser.updateProfile(
      updateUserDto.name !== undefined ? updateUserDto.name : existingUser.name
    );

    // Handle email update
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithNewEmail = new User(
        updatedUser.id,
        updateUserDto.email,
        updatedUser.name,
        updatedUser.password,
        updatedUser.role,
        updatedUser.isActive,
        false, // Reset email verification
        this.generateToken(), // New verification token
        updatedUser.passwordResetToken,
        updatedUser.passwordResetExpires,
        updatedUser.tokenVersion + 1, // Invalidate existing tokens
        updatedUser.lastLoginAt,
        updatedUser.createdAt,
        updatedUser.updatedAt,
        updatedUser.tasks
      );
      return await this.userRepository.update(id, userWithNewEmail);
    }

    return await this.userRepository.update(id, updatedUser);
  }

  async updateUserRole(id: number, updateRoleDto: UpdateUserRoleDto): Promise<User> {
    const user = await this.findUserById(id);
    const updatedUser = user.changeRole(updateRoleDto.role);
    return await this.userRepository.update(id, updatedUser);
  }

  async updateUserStatus(id: number, updateStatusDto: UpdateUserStatusDto): Promise<User> {
    const user = await this.findUserById(id);
    const updatedUser = updateStatusDto.isActive ? user.activate() : user.deactivate();
    return await this.userRepository.update(id, updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    await this.findUserById(id);
    await this.userRepository.delete(id);
  }

  // Query methods
  async getAllUsers(queryDto: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    const filters: UserFilters = {
      role: queryDto.role,
      isActive: queryDto.isActive,
      isEmailVerified: queryDto.isEmailVerified,
      search: queryDto.search,
      createdAfter: queryDto.createdAfter ? new Date(queryDto.createdAfter) : undefined,
      createdBefore: queryDto.createdBefore ? new Date(queryDto.createdBefore) : undefined,
      lastLoginAfter: queryDto.lastLoginAfter ? new Date(queryDto.lastLoginAfter) : undefined,
      lastLoginBefore: queryDto.lastLoginBefore ? new Date(queryDto.lastLoginBefore) : undefined,
    };

    const result = await this.userRepository.findAll(queryDto.page, queryDto.limit, filters);
    
    return {
      users: result.users.map(user => this.mapUserToResponse(user)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<PaginatedUsersResponseDto> {
    const result = await this.userRepository.searchUsers(query, page, limit);
    
    return {
      users: result.users.map(user => this.mapUserToResponse(user)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async getUsersByRole(role: Role): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map(user => this.mapUserToResponse(user));
  }

  async getActiveUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findActiveUsers();
    return users.map(user => this.mapUserToResponse(user));
  }

  async getInactiveUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findInactiveUsers();
    return users.map(user => this.mapUserToResponse(user));
  }

  async getUnverifiedUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findUnverifiedUsers();
    return users.map(user => this.mapUserToResponse(user));
  }

  // Statistics
  async getUserStatistics(): Promise<UserStatisticsDto> {
    return await this.userRepository.getUserStatistics();
  }

  // Bulk operations
  async bulkUpdateRole(bulkUpdateDto: BulkUpdateRoleDto): Promise<void> {
    await this.userRepository.bulkUpdateRole(bulkUpdateDto.userIds, bulkUpdateDto.role);
  }

  async bulkUpdateStatus(bulkUpdateDto: BulkUpdateStatusDto): Promise<void> {
    if (bulkUpdateDto.isActive) {
      await this.userRepository.bulkActivate(bulkUpdateDto.userIds);
    } else {
      await this.userRepository.bulkDeactivate(bulkUpdateDto.userIds);
    }
  }

  // Profile methods
  async getUserProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.findUserById(userId);
    return this.mapUserToResponse(user);
  }

  // Helper methods
  private async validateUserCredentials(loginDto: LoginDto): Promise<User> {
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

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const permissions = ROLE_PERMISSIONS[user.role];
    
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    };

    const refreshPayload = {
      sub: user.id,
      tokenVersion: user.tokenVersion,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.jwt.secret,
        expiresIn: this.configService.jwt.expiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.jwt.refreshSecret,
        expiresIn: this.configService.jwt.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.security.bcryptSaltRounds;
    return await bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}