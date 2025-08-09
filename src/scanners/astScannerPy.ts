import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import type { Signal } from '../core/signals.js';

// Lightweight heuristics (regex/statistical). No heavy deps.
export async function scanASTPython(root: string, max?: number): Promise<Signal[]> {
  const files = (await fg(['**/*.py', '!**/.venv/**', '!**/site-packages/**'], { cwd: root, dot: false }))
    .slice(0, max ?? 200);
  const signals: Signal[] = [];
  let typed = 0, totalFns = 0;

  for (const path of files) {
    const absPath = `${root}/${path}`.replaceAll('//', '/');
    const src = await readFile(absPath, 'utf8').catch(() => '');
    if (!src) continue;

    // crude typing annotation density
    const fnDefs = (src.match(/def\s+\w+\s*\(/g) || []).length;
    const annotated = (src.match(/:\s*[^)=\n]+[)]|\)->/g) || []).length;
    totalFns += fnDefs; typed += Math.min(annotated, fnDefs);

    if (/import\s+logging/.test(src)) signals.push(sig('py.import.logging', true, path));
    if (/from\s+pytest\s+import|import\s+pytest/.test(src)) signals.push(sig('py.test.pytest', true, path));
  }

  const density = totalFns ? typed / totalFns : 0;
  signals.push({
    kind: 'py.typing.density',
    value: density,
    source: { path: files[0] ?? '', lines: [1, 1] },
    weight: 0.5
  });

  return signals;
}

function sig(kind: string, value: unknown, path: string): Signal {
  return { kind, value, source: { path, lines: [1, 200] }, weight: 0.2 };
}
