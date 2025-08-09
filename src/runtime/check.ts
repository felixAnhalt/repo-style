import type { Contract } from '../core/types.js';

export async function runChecks(contract: Contract) {
  // TODO: project rules to existing linters and run them; MVP returns structure only.
  const findings = { summary: contract.rules.map((r) => ({ id: r.id, status: 'unknown' })), hasViolations: false };
  const sarif = { version: '2.1.0', runs: [] };
  return { json: findings, sarif };
}