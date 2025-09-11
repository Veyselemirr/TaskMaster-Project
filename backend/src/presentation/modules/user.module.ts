import { Module } from '@nestjs/common';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../../application/services/user.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { USER_REPOSITORY } from '../../domain/interfaces/user.repository.interface';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository
    }
  ],
  exports: [
    UserService,
    USER_REPOSITORY
  ]
})
export class UserModule {}