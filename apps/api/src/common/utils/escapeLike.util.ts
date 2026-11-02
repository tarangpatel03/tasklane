/** Makes `%`, `_` and `\` in user input match literally inside an ILIKE pattern. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
