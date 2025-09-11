import { Module } from '@nestjs/common';
import { TaskController } from '../controllers/task.controller';
import { EnhancedTaskController } from '../controllers/enhanced-task.controller';
import { TaskService } from '../../application/services/task.service';
import { EnhancedTaskService } from '../../application/services/enhanced-task.service';
import { TaskRepository } from '../../infrastructure/repositories/task.repository';
import { EnhancedTaskRepository } from '../../infrastructure/repositories/enhanced-task.repository';
import { UserModule } from './user.module';
import { ProjectModule } from './project.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { TASK_REPOSITORY } from '../../domain/interfaces/task.repository.interface';
import { ENHANCED_TASK_REPOSITORY } from '../../domain/interfaces/enhanced-task.repository.interface';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    ProjectModule
  ],
  controllers: [
    TaskController,
    EnhancedTaskController
  ],
  providers: [
    // Basic Task Services and Repositories
    TaskService,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskRepository
    },
    
    // Enhanced Task Services and Repositories
    EnhancedTaskService,
    {
      provide: ENHANCED_TASK_REPOSITORY,
      useClass: EnhancedTaskRepository
    }
  ],
  exports: [
    TaskService,
    EnhancedTaskService,
    TASK_REPOSITORY,
    ENHANCED_TASK_REPOSITORY
  ]
})
export class TaskModule {}