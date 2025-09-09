import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
// import { UserModule } from './modules/user.module';
import { ProjectModule } from './modules/project.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    ApplicationModule,
    // UserModule,
    ProjectModule
  ],
  controllers: [TaskController],
})
export class PresentationModule {}