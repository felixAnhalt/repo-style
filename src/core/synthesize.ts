import { Rule } from './types';
import { Signal } from './signals';
import { sha1 } from '../utils/hash';
// LLM integration for implicit rule synthesis
import { chatJson, ChatMessage } from '../integrations/azure';
import fg from 'fast-glob';
import { scanASTPython } from '../scanners/astScannerPy.js';
import { scanASTTs } from '../scanners/astScannerTs.js';
import { readFile } from 'node:fs/promises';

/**
 * Unified rule synthesis:
 * 1. Runs AST scanners to get relevant files and signals.
 * 2. Sends each relevant file to the LLM for implicit rule extraction.
 * 3. Aggregates and deduplicates all rules.
 */
export async function synthesizeRulesUnified(
  repoPath: string,
  opts: { useLLM: boolean; maxFiles?: number }
): Promise<Rule[]> {
  // 1. Run AST scanners to get signals and file lists
  const pySignals = await scanASTPython(repoPath, opts.maxFiles);
  const tsSignals = await scanASTTs(repoPath, opts.maxFiles);

  // Collect unique file paths from signals
  const fileSet = new Set<string>();
  for (const s of pySignals.concat(tsSignals)) {
    if (s.source?.path) fileSet.add(s.source.path);
  }

  // 2. For each file, read content and send to LLM
  let llmRules: Rule[] = [];
  if (opts.useLLM) {
    for (const file of fileSet) {
      const absPath = `${repoPath}/${file}`.replaceAll('//', '/');
      const code = await readFile(absPath, 'utf8').catch(() => '');
      if (!code) continue;

      const prompt: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert software engineer. Infer high-level implicit coding rules, best practices, and patterns from the following file. Focus on actionable, generalizable principles (e.g., "use guard clauses if applicable", "prefer early returns", "avoid deep nesting", "prefer pure functions", "validate inputs", "handle errors explicitly", "prefer immutability", etc). Avoid low-level, config-only, or trivial rules. Do not explain every line or config. Only return a JSON array of rules using the bounded rule template. Return empty if no high-level implicit rules are present.`
        },
        {
          role: 'user',
          content:
`File: ${file}
Content:
${code}
Template:
{
id: string,
title: string,
statement: string,
rationale?: string,
scope: string[],
languages: string[],
severity: "info"|"warn"|"error",
confidence: number,
evidence: { path: string, lines: [number, number], snippetHash: string }[],
autofix?: { kind: string, details: string } | null,
relatedRules?: string[]
}[]
Always return an array of rules, even if empty.
Drop rules with confidence < 0.55.`
        }
      ];

      try {
        const fileRules = await chatJson<{rules: Rule[]}>(prompt);
        llmRules.push(...(fileRules?.rules || [fileRules]));
      } catch (e) {
        console.warn(`LLM synthesis failed for ${file}:`, e);
      }
    }
  }

  // 3. Aggregate explicit rules from signals (as before)
  const explicitRules: Rule[] = [];
  for (const s of pySignals.concat(tsSignals)) {
    if (s.kind === 'config.black.lineLength') {
      explicitRules.push({
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
      explicitRules.push({
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
      explicitRules.push({
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

  // 4. Deduplicate and return
  return dedupeRules([...explicitRules, ...llmRules]);
}

export function dedupeRules(rs: Rule[]): Rule[] {
  const seen = new Set<string>();
  const out: Rule[] = [];
  for (const r of rs) {
    const key = r.id;
    if (seen.has(key)){
      console.warn(`Duplicate rule detected: ${r.id} - ${r.statement}`);
      continue; // Skip duplicates
    }
    seen.add(key); out.push(r);
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}
