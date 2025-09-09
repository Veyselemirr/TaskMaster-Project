import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [ApplicationModule],
  controllers: [TaskController],
})
export class PresentationModule {}