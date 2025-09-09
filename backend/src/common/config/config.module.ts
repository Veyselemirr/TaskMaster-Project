import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import appConfig from '../../config/app.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}