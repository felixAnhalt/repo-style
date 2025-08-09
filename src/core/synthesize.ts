import type { Rule } from './types.js';
import type { Signal } from './signals.js';

export async function synthesizeRules(bundle: { repo: any; signals: Signal[] }, opts: { useLLM: boolean }): Promise<Rule[]> {
  // Minimal MVP: project a couple of high-confidence rules directly from configs; LLM can be wired later.
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
        evidence: [{ path: s.source.path, lines: s.source.lines, snippetHash: 'TODO' }],
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
        evidence: [{ path: s.source.path, lines: s.source.lines, snippetHash: 'TODO' }]
      });
    }
  }
  return rules;
}