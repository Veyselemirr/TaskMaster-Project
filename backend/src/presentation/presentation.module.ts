import { Module } from '@nestjs/common';
import { TaskModule } from './modules/task.module';
import { UserModule } from './modules/user.module';
import { ProjectModule } from './modules/project.module';
import { ApplicationModule } from '../application/application.module';

@Module({
  imports: [
    ApplicationModule,
    UserModule,
    ProjectModule,
    TaskModule
  ],
  controllers: [],
})
export class PresentationModule {}