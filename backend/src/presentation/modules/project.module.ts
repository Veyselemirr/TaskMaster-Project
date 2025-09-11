import { Module } from '@nestjs/common';
import { ProjectController } from '../controllers/project.controller';
import { ProjectService } from '../../application/services/project.service';
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    InfrastructureModule,
    CommonModule
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService
  ],
  exports: [
    ProjectService
  ],
})
export class ProjectModule {}