import { writeFile, readFile } from 'node:fs/promises';
import type { Contract } from '../core/types.js';

export async function suggest(contract: Contract, opts: { apply: boolean; dryRun: boolean }) {
  const changes: { path: string; content: string; reason: string }[] = [];
  for (const r of contract.rules) {
    if (r.id.startsWith('PY-FMT-001')) {
      const len = /\d+/.exec(r.title)?.[0] ?? '88';
      const path = 'pyproject.toml';
      const content = await ensurePyprojectWithBlack(len);
      changes.push({ path, content, reason: 'Ensure Black line length' });
    }
    if (r.id === 'TS-TYPE-003') {
      const path = 'tsconfig.json';
      const content = await ensureTsconfigStrict();
      changes.push({ path, content, reason: 'Enable strict mode' });
    }
  }

  if (opts.dryRun) {
    console.log('# Suggested changes (dry-run)');
    for (const c of changes) {
      console.log(`\n--- ${c.path} (${c.reason})\n` + c.content);
    }
    return;
  }
  if (opts.apply) {
    for (const c of changes) await writeFile(c.path, c.content, 'utf8');
    console.log(`Applied ${changes.length} change(s).`);
  }
}

async function ensurePyprojectWithBlack(lineLength: string) {
  try {
    const existing = await readFile('pyproject.toml', 'utf8');
    if (/\[tool\.black\]/.test(existing) && new RegExp(`line[-_]?length\s*=\s*${lineLength}`).test(existing)) return existing;
  } catch {}
  return `[tool.black]\nline-length = ${lineLength}\n`;
}

async function ensureTsconfigStrict() {
  try {
    const existing = JSON.parse(await readFile('tsconfig.json', 'utf8'));
    existing.compilerOptions = existing.compilerOptions || {};
    existing.compilerOptions.strict = true;
    return JSON.stringify(existing, null, 2);
  } catch {
    return JSON.stringify({ compilerOptions: { strict: true, target: 'ES2022', module: 'ES2022' } }, null, 2);
  }
}
