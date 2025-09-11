import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { TaskRepository } from './repositories/task.repository';
import { EnhancedTaskRepository } from './repositories/enhanced-task.repository';
import { ProjectRepository } from './repositories/project.repository';
import { USER_REPOSITORY } from '../domain/interfaces/user.repository.interface';
import { TASK_REPOSITORY } from '../domain/interfaces/task.repository.interface';
import { ENHANCED_TASK_REPOSITORY } from '../domain/interfaces/enhanced-task.repository.interface';
import { PROJECT_REPOSITORY } from '../domain/interfaces/project.repository.interface';

@Module({
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: TASK_REPOSITORY,
      useClass: TaskRepository,
    },
    {
      provide: ENHANCED_TASK_REPOSITORY,
      useClass: EnhancedTaskRepository,
    },
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectRepository,
    },
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    TASK_REPOSITORY,
    ENHANCED_TASK_REPOSITORY,
    PROJECT_REPOSITORY,
  ],
})
export class InfrastructureModule {}