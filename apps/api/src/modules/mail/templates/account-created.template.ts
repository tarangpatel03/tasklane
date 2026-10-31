import { AccountCreatedInput, MailContent } from '../mail.types';
import { escapeHtml, renderLayout, renderParagraph } from './layout';

/** Invite with the one-time setup code. No link: a localhost link cannot open on a phone. */
export function accountCreatedEmail(input: AccountCreatedInput): MailContent {
  const intro = `Hi ${input.name}, an account has been created for you.`;
  const steps =
    'Open the mobile app, tap "Set up account", then enter your email address, this code and a new password.';
  const validity = `The code is valid for ${input.validHours} hours. If you were not expecting this email, you can ignore it.`;

  const html = renderLayout(
    'Your account is ready',
    renderParagraph(intro) +
      renderParagraph(steps) +
      `<p style="margin:0 0 16px;padding:16px;background:#f3f4f6;border-radius:6px;text-align:center;` +
      `font-family:'Courier New',monospace;font-size:28px;letter-spacing:6px;font-weight:700;color:#111827;">` +
      `${escapeHtml(input.setupCode)}</p>` +
      renderParagraph(validity),
  );
  const text = [intro, '', steps, '', `Setup code: ${input.setupCode}`, '', validity].join('\n');

  return { subject: 'Your Task Management App account is ready', html, text };
}
