import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { PresentationModule } from './presentation/presentation.module';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [
    CommonModule,
    InfrastructureModule,
    ApplicationModule,
    PresentationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
