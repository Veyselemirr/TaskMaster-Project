import { Role } from '../../common/enums/role.enum';
import { User } from './user.entity';
import { Task } from './task.entity';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TeamMemberRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  TESTER = 'TESTER',
  ANALYST = 'ANALYST',
  MEMBER = 'MEMBER'
}

export interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: TeamMemberRole;
  joinedAt: Date;
  isActive: boolean;
  user?: User;
}

export class Project {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: ProjectStatus,
    public readonly priority: ProjectPriority,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly deadline: Date | null,
    public readonly budget: number | null,
    public readonly currency: string | null,
    public readonly isActive: boolean,
    public readonly isPublic: boolean,
    public readonly ownerId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly owner?: User,
    public readonly members?: ProjectMember[],
    public readonly tasks?: Task[]
  ) {}

  static create(
    name: string,
    description: string | null,
    ownerId: number,
    priority: ProjectPriority = ProjectPriority.MEDIUM,
    isPublic: boolean = false,
    startDate?: Date,
    deadline?: Date,
    budget?: number,
    currency?: string
  ): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
    return new Project(
      0,
      name,
      description,
      ProjectStatus.PLANNING,
      priority,
      startDate || null,
      null, // endDate will be set when project completes
      deadline || null,
      budget || null,
      currency || null,
      true, // isActive
      isPublic,
      ownerId,
      new Date(),
      new Date()
    );
  }

  // Status management methods
  startProject(): Project {
    if (this.status !== ProjectStatus.PLANNING) {
      throw new Error('Project can only be started from PLANNING status');
    }
    
    return new Project(
      this.id,
      this.name,
      this.description,
      ProjectStatus.ACTIVE,
      this.priority,
      new Date(), // Set actual start date
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  completeProject(): Project {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error('Only active projects can be completed');
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      ProjectStatus.COMPLETED,
      this.priority,
      this.startDate,
      new Date(), // Set actual end date
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  pauseProject(): Project {
    if (this.status !== ProjectStatus.ACTIVE) {
      throw new Error('Only active projects can be paused');
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      ProjectStatus.ON_HOLD,
      this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  resumeProject(): Project {
    if (this.status !== ProjectStatus.ON_HOLD) {
      throw new Error('Only paused projects can be resumed');
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      ProjectStatus.ACTIVE,
      this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  cancelProject(): Project {
    if (this.status === ProjectStatus.COMPLETED || this.status === ProjectStatus.CANCELLED) {
      throw new Error('Completed or cancelled projects cannot be cancelled again');
    }

    return new Project(
      this.id,
      this.name,
      this.description,
      ProjectStatus.CANCELLED,
      this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      false, // Deactivate cancelled project
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  // Project information update methods
  updateBasicInfo(
    name?: string,
    description?: string | null,
    priority?: ProjectPriority,
    isPublic?: boolean
  ): Project {
    return new Project(
      this.id,
      name ?? this.name,
      description !== undefined ? description : this.description,
      this.status,
      priority ?? this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      isPublic ?? this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  updateSchedule(startDate?: Date | null, deadline?: Date | null): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.status,
      this.priority,
      startDate !== undefined ? startDate : this.startDate,
      this.endDate,
      deadline !== undefined ? deadline : this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  updateBudget(budget?: number | null, currency?: string | null): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.status,
      this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      budget !== undefined ? budget : this.budget,
      currency !== undefined ? currency : this.currency,
      this.isActive,
      this.isPublic,
      this.ownerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  transferOwnership(newOwnerId: number): Project {
    return new Project(
      this.id,
      this.name,
      this.description,
      this.status,
      this.priority,
      this.startDate,
      this.endDate,
      this.deadline,
      this.budget,
      this.currency,
      this.isActive,
      this.isPublic,
      newOwnerId,
      this.createdAt,
      new Date(),
      this.owner,
      this.members,
      this.tasks
    );
  }

  // Business logic methods
  isOverdue(): boolean {
    if (!this.deadline || this.status === ProjectStatus.COMPLETED) {
      return false;
    }
    return this.deadline < new Date();
  }

  isInProgress(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  isCompleted(): boolean {
    return this.status === ProjectStatus.COMPLETED;
  }

  canBeModified(): boolean {
    return this.status !== ProjectStatus.COMPLETED && this.status !== ProjectStatus.CANCELLED;
  }

  getDurationInDays(): number | null {
    if (!this.startDate) return null;
    
    const endDate = this.endDate || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getProgressPercentage(): number {
    if (!this.tasks || this.tasks.length === 0) return 0;
    
    const completedTasks = this.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / this.tasks.length) * 100);
  }

  getActiveMembersCount(): number {
    if (!this.members) return 0;
    return this.members.filter(member => member.isActive).length;
  }

  hasRole(userId: number, role: TeamMemberRole): boolean {
    if (!this.members) return false;
    return this.members.some(
      member => member.userId === userId && 
                member.role === role && 
                member.isActive
    );
  }

  isMember(userId: number): boolean {
    if (this.ownerId === userId) return true;
    if (!this.members) return false;
    return this.members.some(
      member => member.userId === userId && member.isActive
    );
  }

  isManager(userId: number): boolean {
    if (this.ownerId === userId) return true;
    return this.hasRole(userId, TeamMemberRole.PROJECT_MANAGER) ||
           this.hasRole(userId, TeamMemberRole.TEAM_LEAD);
  }

  canUserAccess(userId: number, userRole: Role): boolean {
    // Admin can access everything
    if (userRole === Role.ADMIN) return true;
    
    // Public projects can be accessed by anyone
    if (this.isPublic) return true;
    
    // Project members and owner can access
    return this.isMember(userId);
  }

  canUserEdit(userId: number, userRole: Role): boolean {
    // Admin can edit everything
    if (userRole === Role.ADMIN) return true;
    
    // Project must be modifiable
    if (!this.canBeModified()) return false;
    
    // Owner and managers can edit
    return this.ownerId === userId || this.isManager(userId);
  }
}