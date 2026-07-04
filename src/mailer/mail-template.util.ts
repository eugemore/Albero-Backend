import { readFileSync } from 'fs';
import { join } from 'path';

export function renderMailTemplate(templateFile: string, variables: Record<string, string>): string {
  const raw = readFileSync(join(__dirname, 'templates', templateFile), 'utf8');
  return Object.entries(variables).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    raw,
  );
}
