import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsNumber, 
  IsDateString, 
  IsArray,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  ArrayNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { 
  ProjectStatus, 
  ProjectPriority, 
  TeamMemberRole 
} from '../../domain/entities/project.entity';
import { UserResponseDto } from './user.dto';

// ==================== CREATE PROJECT DTOs ====================

export class CreateProjectDto {
  @ApiProperty({ example: 'TaskMaster Mobile App', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ 
    example: 'A comprehensive task management application for mobile devices',
    maxLength: 1000 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ enum: ProjectPriority, default: ProjectPriority.MEDIUM })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority = ProjectPriority.MEDIUM;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}

// ==================== UPDATE PROJECT DTOs ====================

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'TaskMaster Web App' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ example: 'Updated project description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ enum: ProjectPriority })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateProjectStatusDto {
  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export class UpdateProjectScheduleDto {
  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateProjectBudgetDto {
  @ApiPropertyOptional({ example: 75000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}

export class TransferOwnershipDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  newOwnerId: number;
}

// ==================== TEAM MANAGEMENT DTOs ====================

export class AddTeamMemberDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  userId: number;

  @ApiProperty({ enum: TeamMemberRole, example: TeamMemberRole.DEVELOPER })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: TeamMemberRole, example: TeamMemberRole.TEAM_LEAD })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}

export class BulkAddMembersDto {
  @ApiProperty({ 
    type: [AddTeamMemberDto],
    example: [
      { userId: 3, role: TeamMemberRole.DEVELOPER },
      { userId: 4, role: TeamMemberRole.DESIGNER }
    ]
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddTeamMemberDto)
  members: AddTeamMemberDto[];
}

// ==================== QUERY DTOs ====================

export class ProjectQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectPriority })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'mobile app' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDateAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  startDateBefore?: string;

  @ApiPropertyOptional({ example: '2024-06-01' })
  @IsOptional()
  @IsDateString()
  deadlineAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  deadlineBefore?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  memberUserId?: number;

  @ApiPropertyOptional({ example: 10000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ example: 100000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budgetMax?: number;
}

export class TeamMemberQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  projectId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ enum: TeamMemberRole })
  @IsOptional()
  @IsEnum(TeamMemberRole)
  role?: TeamMemberRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  joinedAfter?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  joinedBefore?: string;
}

// ==================== BULK OPERATIONS DTOs ====================

export class BulkUpdateStatusDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  projectIds: number[];

  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export class BulkUpdatePriorityDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  projectIds: number[];

  @ApiProperty({ enum: ProjectPriority })
  @IsEnum(ProjectPriority)
  priority: ProjectPriority;
}

export class BulkTransferOwnershipDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  projectIds: number[];

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  newOwnerId: number;
}

// ==================== RESPONSE DTOs ====================

export class ProjectMemberResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  userId: number;

  @ApiProperty({ example: 1 })
  projectId: number;

  @ApiProperty({ enum: TeamMemberRole, example: TeamMemberRole.DEVELOPER })
  role: TeamMemberRole;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  joinedAt: Date;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ type: UserResponseDto })
  user?: UserResponseDto;
}

export class ProjectResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TaskMaster Mobile App' })
  name: string;

  @ApiPropertyOptional({ example: 'A comprehensive task management application' })
  description: string | null;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @ApiProperty({ enum: ProjectPriority, example: ProjectPriority.HIGH })
  priority: ProjectPriority;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00Z' })
  startDate: Date | null;

  @ApiPropertyOptional({ example: '2024-03-15T00:00:00Z' })
  endDate: Date | null;

  @ApiPropertyOptional({ example: '2024-06-30T00:00:00Z' })
  deadline: Date | null;

  @ApiPropertyOptional({ example: 50000 })
  budget: number | null;

  @ApiPropertyOptional({ example: 'USD' })
  currency: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: 1 })
  ownerId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: UserResponseDto })
  owner?: UserResponseDto;

  @ApiPropertyOptional({ type: [ProjectMemberResponseDto] })
  members?: ProjectMemberResponseDto[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  tasks?: any[];

  // Computed fields
  @ApiPropertyOptional({ example: 75 })
  progressPercentage?: number;

  @ApiPropertyOptional({ example: 5 })
  membersCount?: number;

  @ApiPropertyOptional({ example: 45 })
  durationInDays?: number;

  @ApiPropertyOptional({ example: false })
  isOverdue?: boolean;
}

export class ProjectSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'TaskMaster Mobile App' })
  name: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @ApiProperty({ enum: ProjectPriority, example: ProjectPriority.HIGH })
  priority: ProjectPriority;

  @ApiPropertyOptional({ example: '2024-06-30T00:00:00Z' })
  deadline: Date | null;

  @ApiProperty({ example: 75 })
  progressPercentage: number;

  @ApiProperty({ example: 5 })
  membersCount: number;

  @ApiProperty({ example: false })
  isOverdue: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  projects: ProjectResponseDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PaginatedProjectSummariesResponseDto {
  @ApiProperty({ type: [ProjectSummaryDto] })
  projects: ProjectSummaryDto[];

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

// ==================== STATISTICS DTOs ====================

export class ProjectStatisticsDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 45 })
  active: number;

  @ApiProperty({ example: 80 })
  completed: number;

  @ApiProperty({ example: 15 })
  cancelled: number;

  @ApiProperty({ example: 8 })
  overdue: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'number'
    },
    example: {
      [ProjectStatus.PLANNING]: 10,
      [ProjectStatus.ACTIVE]: 45,
      [ProjectStatus.ON_HOLD]: 5,
      [ProjectStatus.COMPLETED]: 80,
      [ProjectStatus.CANCELLED]: 15
    }
  })
  byStatus: Record<ProjectStatus, number>;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'number'
    },
    example: {
      [ProjectPriority.LOW]: 30,
      [ProjectPriority.MEDIUM]: 80,
      [ProjectPriority.HIGH]: 30,
      [ProjectPriority.CRITICAL]: 10
    }
  })
  byPriority: Record<ProjectPriority, number>;
}

export class UserProjectStatisticsDto {
  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number', example: 12 },
      active: { type: 'number', example: 8 },
      completed: { type: 'number', example: 4 }
    }
  })
  owned: {
    total: number;
    active: number;
    completed: number;
  };

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number', example: 25 },
      active: { type: 'number', example: 18 },
      completed: { type: 'number', example: 7 }
    }
  })
  member: {
    total: number;
    active: number;
    completed: number;
  };

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'number'
    },
    example: {
      [TeamMemberRole.PROJECT_MANAGER]: 3,
      [TeamMemberRole.TEAM_LEAD]: 2,
      [TeamMemberRole.DEVELOPER]: 15,
      [TeamMemberRole.DESIGNER]: 3,
      [TeamMemberRole.TESTER]: 1,
      [TeamMemberRole.ANALYST]: 1,
      [TeamMemberRole.MEMBER]: 0
    }
  })
  roles: Record<TeamMemberRole, number>;
}

export class DashboardProjectsDto {
  @ApiProperty({ type: [ProjectSummaryDto] })
  owned: ProjectSummaryDto[];

  @ApiProperty({ type: [ProjectSummaryDto] })
  member: ProjectSummaryDto[];

  @ApiProperty({ type: [ProjectSummaryDto] })
  recent: ProjectSummaryDto[];

  @ApiProperty({ type: [ProjectSummaryDto] })
  overdue: ProjectSummaryDto[];

  @ApiProperty({ type: [ProjectSummaryDto] })
  upcomingDeadlines: ProjectSummaryDto[];
}