import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Request,
  ValidationPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiSecurity 
} from '@nestjs/swagger';
import { UserService } from '../../application/services/user.service';
import { Role } from '../../common/enums/role.enum';
import { 
  CurrentUser, 
  Public, 
  Roles, 
  RequirePermissions 
} from '../../common';

import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserQueryDto,
  BulkUpdateRoleDto,
  BulkUpdateStatusDto,
  UserResponseDto,
  LoginResponseDto,
  PaginatedUsersResponseDto,
  UserStatisticsDto
} from '../../application/dtos/user.dto';
import type { AuthUser } from '../../common/types/auth.types';

@ApiTags('Users & Authentication')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== AUTH ENDPOINTS ====================
  
  @Post('auth/register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.userService.register(registerDto);
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

  @Post('auth/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with credentials' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account not active or email not verified' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const result = await this.userService.login(loginDto);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        isActive: (result.user as any).isActive || true,
        isEmailVerified: (result.user as any).isEmailVerified || false,
        lastLoginAt: (result.user as any).lastLoginAt || null,
        createdAt: (result.user as any).createdAt || new Date(),
        updatedAt: (result.user as any).updatedAt || new Date()
      }
    };
  }

  @Post('auth/refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return await this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('auth/forgot-password')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 204, description: 'Password reset email sent (if email exists)' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this.userService.forgotPassword(forgotPasswordDto);
  }

  @Post('auth/reset-password')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiResponse({ status: 204, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.userService.resetPassword(resetPasswordDto);
  }

  @Post('auth/verify-email')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verify email using verification token' })
  @ApiResponse({ status: 204, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    await this.userService.verifyEmail(verifyEmailDto);
  }

  @Put('auth/change-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser('id') userId: number,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    await this.userService.changePassword(userId, changePasswordDto);
  }

  // ==================== PROFILE ENDPOINTS ====================

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: UserResponseDto })
  async getMyProfile(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return await this.userService.getUserProfile(user.id);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: UserResponseDto })
  async updateMyProfile(
    @CurrentUser('id') userId: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(userId, updateUserDto);
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

  // ==================== USER MANAGEMENT ENDPOINTS ====================

  @Get('users')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isEmailVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: PaginatedUsersResponseDto })
  async getAllUsers(@Query() queryDto: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    return await this.userService.getAllUsers(queryDto);
  }

  @Post('users')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
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

  @Get('users/search')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Search users by email or name' })
  @ApiQuery({ name: 'q', type: String, example: 'john' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Search results', type: PaginatedUsersResponseDto })
  async searchUsers(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ): Promise<PaginatedUsersResponseDto> {
    return await this.userService.searchUsers(query, page, limit);
  }

  @Get('users/statistics')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: UserStatisticsDto })
  async getUserStatistics(): Promise<UserStatisticsDto> {
    return await this.userService.getUserStatistics();
  }

  @Get('users/by-role/:role')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: Role, example: Role.USER })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [UserResponseDto] })
  async getUsersByRole(@Param('role') role: Role): Promise<UserResponseDto[]> {
    return await this.userService.getUsersByRole(role);
  }

  @Get('users/active')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get active users' })
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully', type: [UserResponseDto] })
  async getActiveUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getActiveUsers();
  }

  @Get('users/inactive')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get inactive users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Inactive users retrieved successfully', type: [UserResponseDto] })
  async getInactiveUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getInactiveUsers();
  }

  @Get('users/unverified')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get unverified users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Unverified users retrieved successfully', type: [UserResponseDto] })
  async getUnverifiedUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getUnverifiedUsers();
  }

  @Get('users/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return await this.userService.getUserProfile(id);
  }

  @Put('users/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(id, updateUserDto);
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

  @Patch('users/:id/role')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'User role updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateUserRoleDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUserRole(id, updateRoleDto);
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

  @Patch('users/:id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 200, description: 'User status updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUserStatus(id, updateStatusDto);
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

  @Delete('users/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', type: 'number', example: 1 })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }

  // ==================== BULK OPERATIONS ====================

  @Patch('users/bulk/role')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update user roles (Admin only)' })
  @ApiResponse({ status: 204, description: 'User roles updated successfully' })
  async bulkUpdateRole(@Body() bulkUpdateDto: BulkUpdateRoleDto): Promise<void> {
    await this.userService.bulkUpdateRole(bulkUpdateDto);
  }

  @Patch('users/bulk/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk update user status (Admin only)' })
  @ApiResponse({ status: 204, description: 'User status updated successfully' })
  async bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto): Promise<void> {
    await this.userService.bulkUpdateStatus(bulkUpdateDto);
  }
}