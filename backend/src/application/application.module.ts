import { Module } from '@nestjs/common';
import { UserModule } from './user.module';
import { TaskService } from './services/task.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule,
    UserModule,
  ],
  providers: [TaskService],
  exports: [TaskService, UserModule],
})
export class ApplicationModule {}