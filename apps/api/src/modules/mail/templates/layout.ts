import { escapeHtml } from '../../../common/utils/escapeHtml.util';

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
};

/** Subjects must be a single line, so a task title with line breaks cannot add mail headers. */
export function toSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', DAY_FORMAT);
}

/** A label and value list; the values are escaped here. */
export function renderDetails(rows: [label: string, value: string][]): string {
  const cells = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;vertical-align:top;">${escapeHtml(label)}</td>` +
        `<td style="padding:4px 0;color:#111827;font-weight:600;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:15px;">${cells}</table>`;
}

/** A call-to-action link styled as a button, with the plain URL below it for clients that block links. */
export function renderLinkButton(label: string, url: string): string {
  return (
    `<p style="margin:0 0 16px;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;` +
    `background:#111827;color:#ffffff;border-radius:6px;font-size:16px;font-weight:600;text-decoration:none;">` +
    `${escapeHtml(label)}</a></p>` +
    `<p style="margin:0 0 16px;font-size:13px;line-height:1.5;color:#6b7280;word-break:break-all;">` +
    `${escapeHtml(url)}</p>`
  );
}

export function renderParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#111827;">${escapeHtml(text)}</p>`;
}

/**
 * Shared single-column shell, 600px at most and fluid below that. Inline styles only, since many
 * mail clients drop `<style>` blocks. `bodyHtml` must already be escaped.
 */
export function renderLayout(heading: string, bodyHtml: string): string {
  return (
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${escapeHtml(heading)}</title></head>` +
    `<body style="margin:0;padding:0;background:#f3f4f6;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">` +
    `<tr><td align="center" style="padding:24px 12px;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="max-width:600px;background:#ffffff;border-radius:8px;">` +
    `<tr><td style="padding:24px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">` +
    `<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#111827;">${escapeHtml(heading)}</h1>` +
    `${bodyHtml}` +
    `<p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Task Management App</p>` +
    `</td></tr></table></td></tr></table></body></html>`
  );
}
