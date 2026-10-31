import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { AuthTokenType } from '../auth-tokens/auth-token-type';
import { renderInvalidLink, renderPasswordForm, renderSuccess } from './account-pages.html';
import { AuthService } from './auth.service';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
/** Longer than any real token, so oversized input is rejected before it reaches the database. */
const MAX_TOKEN_LENGTH = 200;

/** Apart from the HTML itself, these headers keep the token out of caches, referrers and frames. */
const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy':
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

function asToken(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_TOKEN_LENGTH
    ? value
    : null;
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * The browser pages behind the invite and reset email links. They answer with HTML instead of the
 * JSON envelope, so they handle every outcome themselves and never throw.
 */
@Controller('account')
export class AccountPagesController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('setup')
  showSetup(@Query('token') token: unknown, @Res() res: Response): Promise<void> {
    return this.showForm(AuthTokenType.SETUP, token, res);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('setup')
  submitSetup(@Body() body: unknown, @Res() res: Response): Promise<void> {
    return this.submit(AuthTokenType.SETUP, body, res);
  }

  @Public()
  @Get('reset')
  showReset(@Query('token') token: unknown, @Res() res: Response): Promise<void> {
    return this.showForm(AuthTokenType.RESET, token, res);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('reset')
  submitReset(@Body() body: unknown, @Res() res: Response): Promise<void> {
    return this.submit(AuthTokenType.RESET, body, res);
  }

  /** Does not use up the token, so a mail client previewing the link cannot break it. */
  private async showForm(type: AuthTokenType, rawToken: unknown, res: Response): Promise<void> {
    const token = asToken(rawToken);
    const preview = token ? await this.authService.previewToken(type, token) : null;
    if (!token || !preview) {
      this.send(res, HttpStatus.BAD_REQUEST, renderInvalidLink(type));
      return;
    }
    this.send(res, HttpStatus.OK, renderPasswordForm({ type, token, email: preview.email }));
  }

  private async submit(type: AuthTokenType, body: unknown, res: Response): Promise<void> {
    // Narrowed to a non-null object just above; every field is type-checked before use.
    const fields =
      typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const token = asToken(fields.token);
    const preview = token ? await this.authService.previewToken(type, token) : null;
    if (!token || !preview) {
      this.send(res, HttpStatus.BAD_REQUEST, renderInvalidLink(type));
      return;
    }

    const password = asText(fields.password);
    const error = this.passwordError(password, asText(fields.confirmPassword));
    if (error) {
      this.send(
        res,
        HttpStatus.BAD_REQUEST,
        renderPasswordForm({ type, token, email: preview.email, error }),
      );
      return;
    }

    const result = await this.authService.redeem(type, token, password);
    if (!result) {
      this.send(res, HttpStatus.BAD_REQUEST, renderInvalidLink(type));
      return;
    }
    this.send(res, HttpStatus.OK, renderSuccess(type, result.email));
  }

  private passwordError(password: string, confirmation: string): string | null {
    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      return `The password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters long.`;
    }
    return password === confirmation ? null : 'The two passwords do not match.';
  }

  private send(res: Response, status: HttpStatus, html: string): void {
    res.status(status).set(PAGE_HEADERS).send(html);
  }
}
