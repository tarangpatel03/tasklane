import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthTokensService } from './authTokens.service';
import { AuthToken } from './entities/authToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthToken])],
  providers: [AuthTokensService],
  exports: [AuthTokensService],
})
export class AuthTokensModule {}
