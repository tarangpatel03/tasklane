import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../config/configuration';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    // Global so the app-wide JwtAuthGuard (an APP_GUARD in AppModule) can inject JwtService.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const { accessSecret, accessTtl } = config.get('auth', { infer: true });
        // The library types the TTL as a template-literal string (such as "15m"); env gives a plain string.
        return {
          secret: accessSecret,
          signOptions: { expiresIn: accessTtl as JwtSignOptions['expiresIn'] },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
