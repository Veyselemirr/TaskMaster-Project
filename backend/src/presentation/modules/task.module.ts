import { Module } from '@nestjs/common';
import { TaskController } from '../controllers/task.controller';
import { EnhancedTaskController } from '../controllers/enhanced-task.controller';
import { TaskService } from '../../application/services/task.service';
import { EnhancedTaskService } from '../../application/services/enhanced-task.service';
import { UserModule } from './user.module';
import { ProjectModule } from './project.module';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule,
    UserModule,
    ProjectModule
  ],
  controllers: [
    TaskController,
    EnhancedTaskController
  ],
  providers: [
    TaskService,
    EnhancedTaskService
  ],
  exports: [
    TaskService,
    EnhancedTaskService
  ]
})
export class TaskModule {}