import { writeFile } from 'node:fs/promises';
import type { Contract, Rule } from '../core/types.js';
import { canonicalCommandBlock } from '../core/projector.js';
import { dedupeRules } from '../core/synthesize';

export async function writeAgentsMd(contract: Contract, outPath: string) {
  const blocking = dedupeRules(contract.rules.filter((r) => r.confidence >= 0.55));
  const candidate = dedupeRules(contract.rules.filter((r) => r.confidence < 0.55));
  const lines: string[] = [];
  lines.push('# AGENTS.md — Operational Rules for Coding Agents\n');
  lines.push('## 0) Repository Context');
  lines.push(`- Repo: ${contract.repo.remote ?? 'local'}`);
  lines.push(`- Commit: ${contract.repo.sha}`);
  lines.push('- Languages: (inferred)');
  lines.push('- Build/test entrypoints: (inferred)\n');
  lines.push('## 1) Global Operating Posture');
  lines.push('- Produce the smallest diff possible. Do not refactor unless a rule mandates it.');
  lines.push('- Do not alter CI/publishing unless a rule mandates it.');
  lines.push('- Prefer existing patterns; avoid new libs.\n');
  lines.push('## 2) Enforced Rules (blocking)');
  for (const r of sortRules(blocking)) lines.push(renderRule(r));
  lines.push('\n## 6) 🟡 Candidate Rules (non-blocking)');
  for (const r of sortRules(candidate)) lines.push(renderRule(r));
  lines.push(`\nLast generated: ${contract.generatedAt} • Source: repostyle.contract.yaml\n`);
  await writeFile(outPath, lines.join('\n'), 'utf8');
}

function renderRule(r: Rule): string {
  const ruleDescription: string[] = [
    `### ${r.id} — ${r.title}`,
    `**Statement:** ${r.statement}  `,
    `**Scope:** ${r.scope.join(', ')}  `,
    `**Severity:** ${r.severity}`,
  ]
  if(r.autofix?.details){
    ruleDescription.push(
      '**Autofix:**',
      `- ${r.autofix?.details ?? 'n/a'}`,
      ''
    )
  }
  return ruleDescription.join('\n');
}

function sortRules(rs: Rule[]): Rule[] {
  return [...rs].sort((a, b) => a.id.localeCompare(b.id));
}
