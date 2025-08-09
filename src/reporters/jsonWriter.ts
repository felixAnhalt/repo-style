import { writeFile } from 'node:fs/promises';
import type { Contract } from '../core/types.js';

export async function writeReport(contract: Contract, metrics: Record<string, unknown>) {
  const report = { contractSummary: { ruleCount: contract.rules.length }, metrics };
  await writeFile('repostyle.report.json', JSON.stringify(report, null, 2), 'utf8');
}
