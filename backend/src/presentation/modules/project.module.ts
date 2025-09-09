import { Module } from '@nestjs/common';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../../application/services/project.service';
import { ProjectRepository } from '../../infrastructure/repositories/project.repository';
import { PROJECT_REPOSITORY } from '../../domain/interfaces/project.repository.interface';
// import { UserModule } from './user.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule
    // UserModule
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectRepository,
    },
  ],
  exports: [
    ProjectService,
    PROJECT_REPOSITORY
  ],
})
export class ProjectModule {}