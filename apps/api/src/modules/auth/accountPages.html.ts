import { escapeHtml } from '../../common/utils/escapeHtml.util';
import { AuthTokenType } from '../auth-tokens/authTokenType.enum';

/**
 * The pages behind the invite and reset links. Plain HTML and CSS, no scripts: the form is a normal
 * post, so it works in any browser. The design brief is still empty, so the look is deliberately
 * neutral. Colors, spacing and type sizes are tokens in :root; restyle there once a brief exists.
 */
const STYLES = `
:root {
  --color-bg: #f5f5f3;
  --color-surface: #fcfcfb;
  --color-text: #1c1c1a;
  --color-muted: #5a5a55;
  --color-border: #8f8f88;
  --color-action: #1c1c1a;
  --color-action-hover: #3a3a36;
  --color-on-action: #fcfcfb;
  --color-error: #a4262c;
  --color-error-bg: #fbeceb;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2rem;
  --radius: 0.375rem;
  --tap: 3rem;
  --font: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem);
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font: var(--text-md) / 1.5 var(--font);
}
main {
  width: min(100% - 2 * var(--space-3), 26rem);
  margin: clamp(var(--space-3), 8vh, 4rem) auto;
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius);
}
h1 { margin: 0 0 var(--space-3); font-size: var(--text-lg); line-height: 1.2; }
p { margin: 0 0 var(--space-3); }
.email { overflow-wrap: anywhere; font-weight: 600; }
.field { margin-bottom: var(--space-3); }
label { display: block; margin-bottom: var(--space-1); font-weight: 600; }
.hint { margin: var(--space-1) 0 0; color: var(--color-muted); font-size: var(--text-sm); }
input {
  width: 100%;
  min-height: var(--tap);
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: inherit;
  font: inherit;
}
button {
  width: 100%;
  min-height: var(--tap);
  border: 0;
  border-radius: var(--radius);
  background: var(--color-action);
  color: var(--color-on-action);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
button:hover { background: var(--color-action-hover); }
input:focus-visible, button:focus-visible { outline: 3px solid var(--color-text); outline-offset: 2px; }
.error {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-left: 4px solid var(--color-error);
  background: var(--color-error-bg);
  color: var(--color-error);
}
@media (prefers-reduced-motion: no-preference) {
  button { transition: background-color 150ms ease-out, transform 100ms ease-out; }
  button:active { transform: scale(0.98); }
}
`;

const COPY: Record<AuthTokenType, { title: string; intro: string; submit: string; done: string }> =
  {
    [AuthTokenType.SETUP]: {
      title: 'Choose a password',
      intro: 'Set a password for',
      submit: 'Save password',
      done: 'Your account is ready. Open the mobile app and log in with',
    },
    [AuthTokenType.RESET]: {
      title: 'Choose a new password',
      intro: 'Set a new password for',
      submit: 'Save new password',
      done: 'Your password was changed and you were signed out everywhere else. Open the mobile app and log in with',
    },
  };

function renderPage(title: string, body: string): string {
  return (
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="robots" content="noindex">` +
    `<title>${escapeHtml(title)}</title><style>${STYLES}</style></head>` +
    `<body><main>${body}</main></body></html>`
  );
}

export interface PasswordFormInput {
  type: AuthTokenType;
  email: string;
  token: string;
  error?: string;
}

/** The password and confirm-password form. The token travels in a hidden field. */
export function renderPasswordForm(input: PasswordFormInput): string {
  const copy = COPY[input.type];
  const error = input.error
    ? `<p class="error" role="alert" id="form-error">${escapeHtml(input.error)}</p>`
    : '';
  const described = input.error ? 'form-error' : '';

  return renderPage(
    copy.title,
    `<h1>${escapeHtml(copy.title)}</h1>` +
      `<p>${escapeHtml(copy.intro)} <span class="email">${escapeHtml(input.email)}</span>.</p>` +
      error +
      `<form method="post" action="${input.type}">` +
      `<input type="hidden" name="token" value="${escapeHtml(input.token)}">` +
      // Lets password managers save the new password against this email. The server ignores it.
      `<input type="text" name="username" value="${escapeHtml(input.email)}" autocomplete="username" hidden>` +
      `<div class="field"><label for="password">Password</label>` +
      `<input id="password" name="password" type="password" autocomplete="new-password" ` +
      `required minlength="8" maxlength="128" aria-describedby="${described} password-hint">` +
      `<p class="hint" id="password-hint">At least 8 characters.</p></div>` +
      `<div class="field"><label for="confirm">Confirm password</label>` +
      `<input id="confirm" name="confirmPassword" type="password" autocomplete="new-password" ` +
      `required minlength="8" maxlength="128"></div>` +
      `<button type="submit">${escapeHtml(copy.submit)}</button></form>`,
  );
}

export function renderSuccess(type: AuthTokenType, email: string): string {
  const copy = COPY[type];
  return renderPage(
    'Password saved',
    `<h1>Password saved</h1><p>${escapeHtml(copy.done)} <span class="email">${escapeHtml(email)}</span>` +
      ` and the password you just chose.</p>`,
  );
}

export function renderInvalidLink(type: AuthTokenType): string {
  const next =
    type === AuthTokenType.SETUP
      ? 'Ask an Admin to send you a new invite.'
      : 'Use "Forgot password" in the app to get a new link.';
  return renderPage(
    'Link not valid',
    `<h1>This link is not valid</h1><p>It may have expired or already been used. ${escapeHtml(next)}</p>`,
  );
}
