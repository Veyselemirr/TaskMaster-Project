import { Project, ProjectStatus, ProjectPriority, ProjectMember, TeamMemberRole } from '../entities/project.entity';

export interface ProjectFilters {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  ownerId?: number;
  isActive?: boolean;
  isPublic?: boolean;
  search?: string;
  startDateAfter?: Date;
  startDateBefore?: Date;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
  hasMembers?: boolean;
  memberUserId?: number;
  budgetMin?: number;
  budgetMax?: number;
}

export interface ProjectMemberFilters {
  projectId?: number;
  userId?: number;
  role?: TeamMemberRole;
  isActive?: boolean;
  joinedAfter?: Date;
  joinedBefore?: Date;
}

export interface IProjectRepository {
  // Basic CRUD operations
  findById(id: number): Promise<Project | null>;
  findByIdWithDetails(id: number): Promise<Project | null>;
  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  update(id: number, project: Partial<Project>): Promise<Project>;
  delete(id: number): Promise<void>;
  
  // Advanced queries
  findAll(page?: number, limit?: number, filters?: ProjectFilters): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Owner and member queries
  findByOwnerId(ownerId: number, filters?: ProjectFilters): Promise<Project[]>;
  findByMemberId(userId: number, filters?: ProjectFilters): Promise<Project[]>;
  findPublicProjects(page?: number, limit?: number, filters?: ProjectFilters): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Status-based queries
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findActiveProjects(): Promise<Project[]>;
  findOverdueProjects(): Promise<Project[]>;
  findCompletedProjects(page?: number, limit?: number): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Priority and search
  findByPriority(priority: ProjectPriority): Promise<Project[]>;
  findHighPriorityProjects(): Promise<Project[]>;
  searchProjects(query: string, userId?: number, page?: number, limit?: number): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  
  // Team member operations
  addMember(projectId: number, userId: number, role: TeamMemberRole): Promise<ProjectMember>;
  removeMember(projectId: number, userId: number): Promise<void>;
  updateMemberRole(projectId: number, userId: number, role: TeamMemberRole): Promise<ProjectMember>;
  findProjectMembers(projectId: number, filters?: ProjectMemberFilters): Promise<ProjectMember[]>;
  findMemberProjects(userId: number): Promise<Project[]>;
  isMember(projectId: number, userId: number): Promise<boolean>;
  getMemberRole(projectId: number, userId: number): Promise<TeamMemberRole | null>;
  
  // Statistics and analytics
  countByOwnerId(ownerId: number): Promise<{
    total: number;
    active: number;
    completed: number;
    overdue: number;
  }>;
  
  getProjectStatistics(): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    overdue: number;
    byStatus: Record<ProjectStatus, number>;
    byPriority: Record<ProjectPriority, number>;
  }>;
  
  getUserProjectStatistics(userId: number): Promise<{
    owned: {
      total: number;
      active: number;
      completed: number;
    };
    member: {
      total: number;
      active: number;
      completed: number;
    };
    roles: Record<TeamMemberRole, number>;
  }>;
  
  // Dashboard queries
  findRecentProjects(userId: number, limit?: number): Promise<Project[]>;
  findUpcomingDeadlines(userId: number, days?: number): Promise<Project[]>;
  findUserDashboardProjects(userId: number): Promise<{
    owned: Project[];
    member: Project[];
    recent: Project[];
    overdue: Project[];
  }>;
  
  // Bulk operations
  bulkUpdateStatus(projectIds: number[], status: ProjectStatus): Promise<void>;
  bulkUpdatePriority(projectIds: number[], priority: ProjectPriority): Promise<void>;
  bulkTransferOwnership(projectIds: number[], newOwnerId: number): Promise<void>;
  
  // Archive and restore
  archiveProject(id: number): Promise<void>;
  restoreProject(id: number): Promise<void>;
  findArchivedProjects(ownerId?: number): Promise<Project[]>;
}

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');