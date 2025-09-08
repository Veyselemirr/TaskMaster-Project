import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { TaskController } from './controllers/task.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, TaskController],
})
export class PresentationModule {}