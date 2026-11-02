import { MailContent, PasswordResetInput } from '../mail.types';
import { renderLayout, renderLinkButton, renderParagraph } from './layout';

/** Sent after "Forgot password". Same page flow as the invite, with a shorter validity. */
export function passwordResetEmail(input: PasswordResetInput): MailContent {
  const intro = `Hi ${input.name}, we received a request to reset your password.`;
  const steps =
    'Open the link below in a browser and choose a new password. Then log in to the mobile app with it.';
  const validity = `The link is valid for ${input.validMinutes} minutes and works once. If you did not ask for this, you can ignore this email and your password stays the same.`;

  const html = renderLayout(
    'Reset your password',
    renderParagraph(intro) +
      renderParagraph(steps) +
      renderLinkButton('Choose a new password', input.resetUrl) +
      renderParagraph(validity),
  );
  const text = [intro, '', steps, '', input.resetUrl, '', validity].join('\n');

  return { subject: 'Reset your Task Management App password', html, text };
}
