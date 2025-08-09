import type { Rule } from './types.js';
import type { Signal } from './signals.js';
import { sha1 } from '../utils/hash.js';

export async function synthesizeRules(bundle: { repo: any; signals: Signal[] }, _opts: { useLLM: boolean }): Promise<Rule[]> {
  const rules: Rule[] = [];
  for (const s of bundle.signals) {
    if (s.kind === 'config.black.lineLength') {
      rules.push({
        id: 'PY-FMT-001',
        title: `Black line length ${s.value}`,
        statement: `Python code MUST be formatted by Black with line length ${s.value}.`,
        scope: ['**/*.py'],
        languages: ['python'],
        severity: 'error',
        confidence: 0.95,
        evidence: [{ path: s.source.path, lines: s.source.lines, snippetHash: sha1(`${s.source.path}:${s.source.lines.join('-')}`) }],
        autofix: { kind: 'command', details: `black --line-length ${s.value} .` }
      });
    }
    if (s.kind === 'config.tsconfig.strict' && s.value === true) {
      rules.push({
        id: 'TS-TYPE-003',
        title: 'TypeScript strict mode required',
        statement: 'tsconfig "strict": true must be enabled; avoid exported any.',
        scope: ['**/*.ts', '**/*.tsx'],
        languages: ['typescript'],
        severity: 'error',
        confidence: 0.85,
        evidence: [{ path: s.source.path, lines: s.source.lines, snippetHash: sha1(`${s.source.path}:${s.source.lines.join('-')}`) }]
      });
    }
    if (s.kind === 'ts.export.any.count' && typeof s.value === 'number' && s.value > 0) {
      rules.push({
        id: 'TS-TYPE-004',
        title: 'No exported any types',
        statement: 'Avoid exporting APIs that use `any` types.',
        scope: ['**/*.ts', '**/*.tsx'],
        languages: ['typescript'],
        severity: 'warn',
        confidence: 0.7,
        evidence: [{ path: s.source.path, lines: s.source.lines, snippetHash: sha1(`${s.source.path}:${s.source.lines.join('-')}`) }]
      });
    }
  }
  return dedupeRules(rules);
}

function dedupeRules(rs: Rule[]): Rule[] {
  const seen = new Set<string>();
  const out: Rule[] = [];
  for (const r of rs) {
    const key = `${r.id}:${r.statement}`;
    if (seen.has(key)) continue; seen.add(key); out.push(r);
  }
  return out.sort((a,b)=>a.id.localeCompare(b.id));
}
