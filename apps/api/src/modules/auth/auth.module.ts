import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { AuthTokensModule } from '../auth-tokens/auth-tokens.module';
import { MailModule } from '../mail/mail.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { UsersModule } from '../users/users.module';
import { AccountPagesController } from './account-pages.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    RefreshTokensModule,
    AuthTokensModule,
    MailModule,
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
          signOptions: { algorithm: 'HS256', expiresIn: accessTtl as JwtSignOptions['expiresIn'] },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  controllers: [AuthController, AccountPagesController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
