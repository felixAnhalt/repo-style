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
          content: `Got it. Your current prompt lets the model drift into meta/config trivia. Here’s a tighter, principle-first version that forces high-level, broadly applicable rules and explicitly bans the noise you saw.

Use this verbatim as the single prompt you send for each file.

⸻

Improved prompt (drop-in)

You are an expert software engineer and code reviewer.

Task: From the file below, extract only the highest-leverage coding principles actually evidenced by the code — the kind that shape how code is written (control flow, error posture, function design, state, testing discipline), not low-level implementation details.

Output: Return only a JSON array of rules (no prose), each following this template:

{
  "id": "kebab-case-id",
  "title": "Short, principle-level title",
  "statement": "Single-sentence, testable principle using MUST/SHOULD.",
  "rationale": "Why this raises quality/maintainability.",
  "scope": ["**/*"],
  "languages": ["<language(s)>"],
  "severity": "error|warn|info",
  "confidence": 0.0,
  "evidence": [
    { "path": "<file path>", "lines": [startLine, endLine], "snippetHash": "NA" }
  ]
}

\t•\tid: kebab-case, ≤3 words, derived from the concept (e.g., prefer-early-return, validate-inputs).
\t•\tseverity: how strongly the team treats violations (principle-level defaults: warn; hard rules: error; soft style: info).
\t•\tconfidence: 0–1. Use higher values only if the file clearly signals the principle (naming, comments, repeated patterns).
\t•\tevidence: 1–3 spans that demonstrate the principle; set snippetHash to "NA" (downstream will fill it).

Inclusions (good):
\t•\tControl flow norms: prefer guard clauses / early return, avoid deep nesting, fail fast on invalid state.
\t•\tError handling posture: validate at boundaries, explicit error handling, no silent catch, add context.
\t•\tFunction & module design: single responsibility, small functions, pure core & side-effect edges, immutability by default.
\t•\tAPI & types: narrow, explicit types; avoid leaking any in public interfaces; stable boundaries.
\t•\tTesting stance: fast unit tests for logic; a few e2e for wiring (only if evidence in file suggests this).
\t•\tNaming/semantics patterns that reflect domain thinking (not mere style).

Exclusions (hard):
Reject any rule that is:
\t•\tMeta/infra/config-only: CLI wiring, CI/SARIF formatting, reporter layout, Ajv/tsup/Commander minutiae, dotenv/env shims, GitHub API conveniences.
\t•\tLibrary- or file-specific how-tos: “use promisify(exec)”, “call parseAsync”, “set maxBuffer”, “use js-yaml dump”, “use low temperature for Azure OpenAI”.
\t•\tRestating syntax or obvious language defaults.
\t•\tOne-off optimizations or codebase plumbing that doesn’t generalize across files.
\t•\tDocumentation/reporting conventions (e.g., how AGENTS.md is rendered).

Quality gates (apply before emitting any rule):
\t1.\tPrinciple level? If it mentions a specific package, function name, file path, or output format → discard unless it clearly generalizes beyond that detail.
\t2.\tBroadly enforceable? Could a linter/codereview checklist meaningfully check it? If not → discard.
\t3.\tActionable & testable? Must be a single sentence a reviewer could uphold.
\t4.\tEvidence-backed? Point to lines that actually show the principle (naming, branching, error flows, data handling, comments). No evidence → discard.
\t5.\tNon-duplicative? Merge overlaps; keep the clearest, broadest form.

Quantity & ordering:
\t•\tEmit 3–10 rules maximum — pick only the top impact items.
\t•\tSort by impact (error > warn > info), then descending confidence.

Tone/wording:
\t•\tUse MUST/SHOULD and avoid weasel words (“try to”, “consider”).
\t•\tBe concise; no examples inside statements.

If no high-level principles are evidenced in this file: return [].`
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
  return out.sort((a, b) => a.id?.localeCompare(b.id) || 0);
}
