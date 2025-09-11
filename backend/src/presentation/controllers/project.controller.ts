import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { ProjectService } from '../../application/services/project.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';
import { Role } from '../../common/enums/role.enum';
import { ProjectStatus, ProjectPriority, TeamMemberRole } from '../../domain/entities/project.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectStatusDto,
  UpdateProjectScheduleDto,
  UpdateProjectBudgetDto,
  TransferOwnershipDto,
  AddTeamMemberDto,
  UpdateMemberRoleDto,
  BulkAddMembersDto,
  ProjectQueryDto,
  TeamMemberQueryDto,
  BulkUpdateStatusDto,
  BulkUpdatePriorityDto,
  BulkTransferOwnershipDto,
  ProjectResponseDto,
  ProjectSummaryDto,
  PaginatedProjectsResponseDto,
  PaginatedProjectSummariesResponseDto,
  ProjectMemberResponseDto,
  ProjectStatisticsDto,
  UserProjectStatisticsDto,
  DashboardProjectsDto
} from '../../application/dtos/project.dto';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
@ApiBearerAuth()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ==================== PROJECT CRUD OPERATIONS ====================

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: CreateProjectDto })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(req.user.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: PaginatedProjectsResponseDto
  })
  @ApiQuery({ type: ProjectQueryDto })
  async getAllProjects(
    @Query() query: ProjectQueryDto,
    @Request() req: any
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectService.getAllProjects(req.user.id, req.user.role, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get project summaries for quick overview' })
  @ApiResponse({
    status: 200,
    description: 'Project summaries retrieved successfully',
    type: PaginatedProjectSummariesResponseDto
  })
  @ApiQuery({ type: ProjectQueryDto })
  async getProjectSummaries(
    @Query() query: ProjectQueryDto,
    @Request() req: any
  ): Promise<PaginatedProjectSummariesResponseDto> {
    // TODO: Implement getProjectSummaries method
    return { projects: [], total: 0, page: 1, totalPages: 0 };
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Get projects owned by current user' })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  @ApiQuery({ type: ProjectQueryDto })
  async getMyProjects(
    @Query() query: ProjectQueryDto,
    @Request() req: any
  ): Promise<ProjectResponseDto[]> {
    // TODO: Implement getMyProjects method  
    return [];
  }

  @Get('member-projects')
  @ApiOperation({ summary: 'Get projects where current user is a member' })
  @ApiResponse({
    status: 200,
    description: 'Member projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  @ApiQuery({ type: ProjectQueryDto })
  async getMemberProjects(
    @Query() query: ProjectQueryDto,
    @Request() req: any
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectService.getUserProjects(req.user.id, query);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public projects' })
  @ApiResponse({
    status: 200,
    description: 'Public projects retrieved successfully',
    type: PaginatedProjectsResponseDto
  })
  @ApiQuery({ type: ProjectQueryDto })
  async getPublicProjects(
    @Query() query: ProjectQueryDto
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectService.getPublicProjects(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search projects by name or description' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: PaginatedProjectsResponseDto
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchProjects(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectService.searchProjects(query, req.user.id, req.user.role, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiParam({ name: 'id', type: Number })
  async getProjectById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.getProjectById(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project basic information' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProjectDto })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(id, req.user.id, req.user.role, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiParam({ name: 'id', type: Number })
  async deleteProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.projectService.deleteProject(id, req.user.id, req.user.role);
    return { message: 'Project deleted successfully' };
  }

  // ==================== PROJECT STATUS MANAGEMENT ====================

  @Put(':id/status')
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({
    status: 200,
    description: 'Project status updated successfully',
    type: ProjectResponseDto
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProjectStatusDto })
  async updateProjectStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateProjectStatusDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectStatus(
      id,
      req.user.id,
      req.user.role,
      updateStatusDto
    );
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start project' })
  @ApiResponse({
    status: 200,
    description: 'Project started successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  async startProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectStatus(
      id,
      req.user.id,
      req.user.role,
      { status: ProjectStatus.ACTIVE }
    );
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete project' })
  @ApiResponse({
    status: 200,
    description: 'Project completed successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  async completeProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectStatus(
      id,
      req.user.id,
      req.user.role,
      { status: ProjectStatus.COMPLETED }
    );
  }

  @Put(':id/pause')
  @ApiOperation({ summary: 'Pause project' })
  @ApiResponse({
    status: 200,
    description: 'Project paused successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  async pauseProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectStatus(
      id,
      req.user.id,
      req.user.role,
      { status: ProjectStatus.ON_HOLD }
    );
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel project' })
  @ApiResponse({
    status: 200,
    description: 'Project cancelled successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  async cancelProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectStatus(
      id,
      req.user.id,
      req.user.role,
      { status: ProjectStatus.CANCELLED }
    );
  }

  // ==================== PROJECT SCHEDULE MANAGEMENT ====================

  @Put(':id/schedule')
  @ApiOperation({ summary: 'Update project schedule' })
  @ApiResponse({
    status: 200,
    description: 'Project schedule updated successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProjectScheduleDto })
  async updateProjectSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateProjectScheduleDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectSchedule(
      id,
      req.user.id,
      req.user.role,
      updateScheduleDto
    );
  }

  @Put(':id/budget')
  @ApiOperation({ summary: 'Update project budget' })
  @ApiResponse({
    status: 200,
    description: 'Project budget updated successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateProjectBudgetDto })
  async updateProjectBudget(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateProjectBudgetDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProjectBudget(
      id,
      req.user.id,
      req.user.role,
      updateBudgetDto
    );
  }

  @Put(':id/transfer-ownership')
  @ApiOperation({ summary: 'Transfer project ownership' })
  @ApiResponse({
    status: 200,
    description: 'Project ownership transferred successfully',
    type: ProjectResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: TransferOwnershipDto })
  async transferOwnership(
    @Param('id', ParseIntPipe) id: number,
    @Body() transferDto: TransferOwnershipDto,
    @Request() req: any
  ): Promise<ProjectResponseDto> {
    return this.projectService.transferOwnership(
      id,
      transferDto.newOwnerId,
      req.user.id,
      req.user.role
    );
  }

  // ==================== TEAM MANAGEMENT ====================

  @Get(':id/members')
  @ApiOperation({ summary: 'Get project team members' })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
    type: [ProjectMemberResponseDto]
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ type: TeamMemberQueryDto })
  async getTeamMembers(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TeamMemberQueryDto,
    @Request() req: any
  ): Promise<ProjectMemberResponseDto[]> {
    return this.projectService.getTeamMembers(id, query, req.user.id, req.user.role);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add team member to project' })
  @ApiResponse({
    status: 201,
    description: 'Team member added successfully',
    type: ProjectMemberResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AddTeamMemberDto })
  async addTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() addMemberDto: AddTeamMemberDto,
    @Request() req: any
  ): Promise<ProjectMemberResponseDto> {
    return this.projectService.addTeamMember(
      id,
      req.user.id,
      req.user.role,
      addMemberDto
    );
  }

  @Post(':id/members/bulk')
  @ApiOperation({ summary: 'Add multiple team members to project' })
  @ApiResponse({
    status: 201,
    description: 'Team members added successfully',
    type: [ProjectMemberResponseDto]
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: BulkAddMembersDto })
  async addMultipleTeamMembers(
    @Param('id', ParseIntPipe) id: number,
    @Body() bulkAddDto: BulkAddMembersDto,
    @Request() req: any
  ): Promise<ProjectMemberResponseDto[]> {
    return this.projectService.addMultipleTeamMembers(
      id,
      bulkAddDto.members,
      req.user.id,
      req.user.role
    );
  }

  @Put(':id/members/:userId/role')
  @ApiOperation({ summary: 'Update team member role' })
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully',
    type: ProjectMemberResponseDto
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  @ApiBody({ type: UpdateMemberRoleDto })
  async updateMemberRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateRoleDto: UpdateMemberRoleDto,
    @Request() req: any
  ): Promise<ProjectMemberResponseDto> {
    return this.projectService.updateMemberRole(
      id,
      userId,
      updateRoleDto.role as any,
      req.user.id,
      req.user.role
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove team member from project' })
  @ApiResponse({ status: 200, description: 'Team member removed successfully' })
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'userId', type: Number })
  async removeTeamMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.projectService.removeTeamMember(id, userId, req.user.id, req.user.role);
    return { message: 'Team member removed successfully' };
  }

  // ==================== DASHBOARD AND ANALYTICS ====================

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get user dashboard projects overview' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    type: DashboardProjectsDto
  })
  async getUserDashboard(@Request() req: any): Promise<DashboardProjectsDto> {
    return this.projectService.getUserDashboard(req.user.id);
  }

  @Get('statistics/user')
  @ApiOperation({ summary: 'Get user project statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserProjectStatisticsDto
  })
  async getUserStatistics(@Request() req: any): Promise<UserProjectStatisticsDto> {
    return this.projectService.getUserStatistics(req.user.id);
  }

  @Get('statistics/global')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get global project statistics (Admin/PM only)' })
  @ApiResponse({
    status: 200,
    description: 'Global statistics retrieved successfully',
    type: ProjectStatisticsDto
  })
  @ApiResponse({ status: 403, description: 'Access denied - Admin/PM role required' })
  async getGlobalStatistics(): Promise<ProjectStatisticsDto> {
    return this.projectService.getGlobalStatistics();
  }

  @Get('overdue/list')
  @ApiOperation({ summary: 'Get overdue projects for current user' })
  @ApiResponse({
    status: 200,
    description: 'Overdue projects retrieved successfully',
    type: [ProjectSummaryDto]
  })
  async getOverdueProjects(@Request() req: any): Promise<ProjectSummaryDto[]> {
    return this.projectService.getOverdueProjects(req.user.id);
  }

  @Get('upcoming-deadlines')
  @ApiOperation({ summary: 'Get projects with upcoming deadlines' })
  @ApiResponse({
    status: 200,
    description: 'Projects with upcoming deadlines retrieved successfully',
    type: [ProjectSummaryDto]
  })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days ahead to check (default: 7)' })
  async getUpcomingDeadlines(
    @Query('days') days: number = 7,
    @Request() req: any
  ): Promise<ProjectSummaryDto[]> {
    return this.projectService.getUpcomingDeadlines(req.user.id, days);
  }

  @Get('recent/activity')
  @ApiOperation({ summary: 'Get recently updated projects' })
  @ApiResponse({
    status: 200,
    description: 'Recent projects retrieved successfully',
    type: [ProjectSummaryDto]
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of projects to return (default: 10)' })
  async getRecentProjects(
    @Query('limit') limit: number = 10,
    @Request() req: any
  ): Promise<ProjectSummaryDto[]> {
    return this.projectService.getRecentProjects(req.user.id, limit);
  }

  // ==================== ADMIN BULK OPERATIONS ====================

  @Put('bulk/status')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Bulk update project status (Admin/PM only)' })
  @ApiResponse({ status: 200, description: 'Projects status updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin/PM role required' })
  @ApiBody({ type: BulkUpdateStatusDto })
  async bulkUpdateStatus(
    @Body() bulkUpdateDto: BulkUpdateStatusDto,
    @Request() req: any
  ): Promise<{ message: string; updated: number }> {
    const updated = await this.projectService.bulkUpdateStatus(
      bulkUpdateDto.projectIds,
      bulkUpdateDto.status,
      req.user.id,
      req.user.role
    );
    return { message: 'Projects status updated successfully', updated };
  }

  @Put('bulk/priority')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Bulk update project priority (Admin/PM only)' })
  @ApiResponse({ status: 200, description: 'Projects priority updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin/PM role required' })
  @ApiBody({ type: BulkUpdatePriorityDto })
  async bulkUpdatePriority(
    @Body() bulkUpdateDto: BulkUpdatePriorityDto,
    @Request() req: any
  ): Promise<{ message: string; updated: number }> {
    const updated = await this.projectService.bulkUpdatePriority(
      bulkUpdateDto.projectIds,
      bulkUpdateDto.priority,
      req.user.id,
      req.user.role
    );
    return { message: 'Projects priority updated successfully', updated };
  }

  @Put('bulk/transfer-ownership')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk transfer project ownership (Admin only)' })
  @ApiResponse({ status: 200, description: 'Projects ownership transferred successfully' })
  @ApiResponse({ status: 403, description: 'Access denied - Admin role required' })
  @ApiBody({ type: BulkTransferOwnershipDto })
  async bulkTransferOwnership(
    @Body() bulkTransferDto: BulkTransferOwnershipDto,
    @Request() req: any
  ): Promise<{ message: string; updated: number }> {
    const updated = await this.projectService.bulkTransferOwnership(
      bulkTransferDto.projectIds,
      bulkTransferDto.newOwnerId,
      req.user.id,
      req.user.role
    );
    return { message: 'Projects ownership transferred successfully', updated };
  }

  // ==================== ARCHIVE OPERATIONS ====================

  @Put(':id/archive')
  @ApiOperation({ summary: 'Archive project' })
  @ApiResponse({ status: 200, description: 'Project archived successfully' })
  @ApiParam({ name: 'id', type: Number })
  async archiveProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.projectService.archiveProject(id, req.user.id, req.user.role);
    return { message: 'Project archived successfully' };
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore archived project' })
  @ApiResponse({ status: 200, description: 'Project restored successfully' })
  @ApiParam({ name: 'id', type: Number })
  async restoreProject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.projectService.restoreProject(id, req.user.id, req.user.role);
    return { message: 'Project restored successfully' };
  }

  @Get('archived/list')
  @ApiOperation({ summary: 'Get archived projects' })
  @ApiResponse({
    status: 200,
    description: 'Archived projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  async getArchivedProjects(@Request() req: any): Promise<ProjectResponseDto[]> {
    return this.projectService.getArchivedProjects(req.user.id, req.user.role);
  }

  // ==================== FILTER ENDPOINTS ====================

  @Get('filter/status/:status')
  @ApiOperation({ summary: 'Get projects by status' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  @ApiParam({ 
    name: 'status', 
    enum: ProjectStatus,
    description: 'Project status to filter by'
  })
  async getProjectsByStatus(
    @Param('status') status: ProjectStatus,
    @Request() req: any
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getProjectsByStatus(status, req.user.id, req.user.role);
  }

  @Get('filter/priority/:priority')
  @ApiOperation({ summary: 'Get projects by priority' })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  @ApiParam({ 
    name: 'priority', 
    enum: ProjectPriority,
    description: 'Project priority to filter by'
  })
  async getProjectsByPriority(
    @Param('priority') priority: ProjectPriority,
    @Request() req: any
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getProjectsByPriority(priority, req.user.id, req.user.role);
  }

  @Get('filter/high-priority')
  @ApiOperation({ summary: 'Get high priority projects' })
  @ApiResponse({
    status: 200,
    description: 'High priority projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  async getHighPriorityProjects(@Request() req: any): Promise<ProjectResponseDto[]> {
    return this.projectService.getHighPriorityProjects(req.user.id, req.user.role);
  }

  @Get('filter/active')
  @ApiOperation({ summary: 'Get active projects' })
  @ApiResponse({
    status: 200,
    description: 'Active projects retrieved successfully',
    type: [ProjectResponseDto]
  })
  async getActiveProjects(@Request() req: any): Promise<ProjectResponseDto[]> {
    return this.projectService.getActiveProjects(req.user.id, req.user.role);
  }

  @Get('filter/completed')
  @ApiOperation({ summary: 'Get completed projects with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Completed projects retrieved successfully',
    type: PaginatedProjectsResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCompletedProjects(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req: any
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectService.getCompletedProjects(page, limit, req.user.id, req.user.role);
  }
}