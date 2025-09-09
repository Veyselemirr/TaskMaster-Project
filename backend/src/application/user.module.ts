import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Common imports
import { CommonModule } from '../common/common.module';
import { ConfigService } from '../common/config/config.service';

// Infrastructure imports
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../domain/interfaces/user.repository.interface';

// Application layer
import { UserService } from './services/user.service';

// Presentation layer
import { UserController } from '../presentation/controllers/user.controller';

@Module({
  imports: [
    CommonModule,
    InfrastructureModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [CommonModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: {
          expiresIn: configService.jwt.expiresIn,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [
    UserService,
    USER_REPOSITORY,
  ],
})
export class UserModule {}