import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { TaskRepository } from './repositories/task.repository';
import { USER_REPOSITORY } from '../domain/interfaces/user.repository.interface';
import { TASK_REPOSITORY } from '../domain/interfaces/task.repository.interface';

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
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    TASK_REPOSITORY,
  ],
})
export class InfrastructureModule {}