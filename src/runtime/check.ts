import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Contract } from '../core/types.js';
import { canonicalCommandBlock } from '../core/projector.js';

const pexec = promisify(exec);

export async function runChecks(contract: Contract) {
  const cmd = canonicalCommandBlock(contract);
  let ok = true; let stdout = ''; let stderr = '';
  if (cmd.trim()) {
    try {
      const res = await pexec(cmd, { maxBuffer: 10 * 1024 * 1024 });
      stdout = res.stdout;
    } catch (e: any) {
      ok = false; stdout = e.stdout ?? ''; stderr = e.stderr ?? String(e);
    }
  }
  const findings = {
    summary: contract.rules.map((r) => ({ id: r.id, status: ok ? 'pass' : 'fail' })),
    hasViolations: !ok,
    stdout, stderr
  };
  const sarif = minimalSarif(findings, contract);
  return { json: findings as any, sarif };
}

function minimalSarif(findings: any, contract: Contract) {
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'repostyle', version: '0.1.0' } },
      results: findings.hasViolations ? contract.rules.map((r) => ({
        ruleId: r.id,
        level: r.severity === 'error' ? 'error' : 'warning',
        message: { text: `Rule ${r.id} failed in aggregated check.` }
      })) : []
    }]
  };
}
