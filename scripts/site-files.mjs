import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export function htmlFiles(dir = '.') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    if (e.name.startsWith('.') || e.name === 'node_modules') return [];
    const path = join(dir, e.name);
    return e.isDirectory() ? htmlFiles(path) : e.name.endsWith('.html') ? [path] : [];
  }).sort();
}
