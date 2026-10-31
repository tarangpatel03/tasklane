import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTestAccount, createTransport, getTestMessageUrl, Transporter } from 'nodemailer';
import { AppConfig } from '../../config/configuration';
import { MailContent } from './mail.types';

const SMTPS_PORT = 465;
const FALLBACK_FROM = 'no-reply@taskapp.local';

interface ResolvedTransport {
  transporter: Transporter;
  from: string;
  /** Ethereal does not deliver anything; the log carries a preview URL instead. */
  isEthereal: boolean;
}

/**
 * Sends email over SMTP. With `SMTP_HOST` empty it creates an Ethereal test account on first use,
 * so the project runs without any mail setup.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transport?: Promise<ResolvedTransport>;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  /**
   * Sends one email. Never throws: mail must not break the request that triggered it, so a failure
   * is logged (message only, never credentials or the body) and `false` is returned.
   */
  async send(to: string, content: MailContent): Promise<boolean> {
    try {
      const { transporter, from, isEthereal } = await this.getTransport();
      const info = await transporter.sendMail({
        from,
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });
      if (isEthereal) {
        this.logger.log(`Email "${content.subject}" preview: ${String(getTestMessageUrl(info))}`);
      } else {
        this.logger.log(`Email sent: "${content.subject}"`);
      }
      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Could not send email "${content.subject}": ${reason}`);
      return false;
    }
  }

  private getTransport(): Promise<ResolvedTransport> {
    // A failed setup (for example Ethereal being unreachable) is not cached, so the next send retries it.
    this.transport ??= this.createResolvedTransport().catch((error: unknown) => {
      this.transport = undefined;
      throw error;
    });
    return this.transport;
  }

  private async createResolvedTransport(): Promise<ResolvedTransport> {
    const { host, port, user, pass, from } = this.config.get('mail', { infer: true });

    if (host) {
      return {
        transporter: createTransport({
          host,
          port,
          // Port 465 is TLS from the first byte; every other port starts plain and must upgrade
          // with STARTTLS, which requireTLS enforces (no silent fallback to plain text).
          secure: port === SMTPS_PORT,
          requireTLS: port !== SMTPS_PORT,
          auth: user && pass ? { user, pass } : undefined,
        }),
        from: from ?? user ?? FALLBACK_FROM,
        isEthereal: false,
      };
    }

    const account = await createTestAccount();
    this.logger.warn(
      'SMTP_HOST is empty: using an Ethereal test account. Emails are not delivered, preview URLs are logged.',
    );
    return {
      transporter: createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      }),
      from: from ?? account.user,
      isEthereal: true,
    };
  }
}
