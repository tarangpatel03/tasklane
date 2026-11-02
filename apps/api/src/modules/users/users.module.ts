import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokensModule } from '../auth-tokens/authTokens.module';
import { MailModule } from '../mail/mail.module';
import { RefreshTokensModule } from '../refresh-tokens/refreshTokens.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), RefreshTokensModule, AuthTokensModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
