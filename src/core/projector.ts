import type { Contract, Rule } from './types.js';

export function ruleToCommands(rule: Rule): string[] {
  if (rule.id.startsWith('PY-FMT')) return [`black --check .`];
  if (rule.id.startsWith('TS-TYPE')) return [
    'tsc -p tsconfig.json --noEmit',
    'eslint . --max-warnings 0',
    'prettier -c .'
  ];
  return [];
}

export function canonicalCommandBlock(contract: Contract): string {
  const uniq = new Set<string>();
  contract.rules.forEach((r) => ruleToCommands(r).forEach((c) => uniq.add(c)));
  return Array.from(uniq).join(' && ');
}
