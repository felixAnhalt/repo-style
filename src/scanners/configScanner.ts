import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import type { Signal } from '../core/signals.js';

export async function scanConfigs(root: string): Promise<Signal[]> {
  const signals: Signal[] = [];
  for (const path of await fg(['pyproject.toml', 'tsconfig.json', 'package.json', '.prettierrc*', 'ruff.toml'], { cwd: root, dot: true })) {
    const abs = `${root}/${path}`.replaceAll('//', '/');
    const text = await readFile(abs, 'utf8').catch(() => '');
    if (!text) continue;
    if (path === 'pyproject.toml') {
      const lineLen = /line\s*[-_]?length\s*=\s*(\d+)/i.exec(text)?.[1];
      if (lineLen) signals.push(sig('config.black.lineLength', Number(lineLen), path, [1, 100]));
    }
    if (path === 'tsconfig.json') {
      try {
        const j = JSON.parse(text);
        if (j.compilerOptions?.strict === true) signals.push(sig('config.tsconfig.strict', true, path, [1, 50]));
      } catch {}
    }
  }
  return signals;
}

function sig(kind: string, value: unknown, path: string, lines: [number, number]): Signal {
  return { kind, value, source: { path, lines }, weight: 1 };
}