import { writeFile } from 'node:fs/promises';
import { dump } from 'js-yaml';
import type { Contract, Rule } from '../core/types.js';

export async function writeContract(repo: Contract['repo'], rules: Rule[]): Promise<Contract> {
  const contract: Contract = { schemaVersion: '1.0', repo, generatedAt: new Date().toISOString(), rules };
  await writeFile('repostyle.contract.yaml', dump(contract, { lineWidth: 100 }), 'utf8');
  return contract;
}