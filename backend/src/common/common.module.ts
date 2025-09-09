import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

// Config
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

// Interceptors
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// Filters
import { HttpExceptionFilter, AllExceptionsFilter } from './filters/http-exception.filter';

// Pipes
import { ValidationPipe } from './pipes/validation.pipe';

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: {
          expiresIn: configService.jwt.expiresIn,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    
    // Global Exception Filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    
    // Other providers
    ValidationPipe,
  ],
  exports: [
    ConfigService,
    JwtModule,
    ValidationPipe,
  ],
})
export class CommonModule {}