export type Evidence = { path: string; lines: [number, number]; snippetHash: string };
export type Rule = {
  id: string; title: string; statement: string; rationale?: string;
  scope: string[]; languages: string[]; severity: 'info' | 'warn' | 'error';
  confidence: number; evidence: Evidence[]; autofix?: { kind: string; details: string } | null;
  relatedRules?: string[];
};
export type Contract = {
  schemaVersion: '1.0';
  repo: { remote?: string; sha: string };
  generatedAt: string;
  rules: Rule[];
  metrics?: Record<string, unknown>;
};
