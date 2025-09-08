import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TaskService } from './services/task.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [UserService, TaskService],
  exports: [UserService, TaskService],
})
export class ApplicationModule {}