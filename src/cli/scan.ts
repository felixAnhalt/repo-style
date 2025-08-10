import { Command } from 'commander';
import { writeContract } from '../reporters/yamlWriter.js';
import { writeReport } from '../reporters/jsonWriter.js';

import { materializeRepo } from '../utils/git';
import { synthesizeRulesUnified } from '../core/synthesize';

export const executeScan = async (pathOrUrl, opts) => {
  const repoInfo = await materializeRepo(pathOrUrl, opts.rev);
  const rules = await synthesizeRulesUnified(repoInfo.path, { useLLM: opts.noLlm !== true });
  const contract = await writeContract(
    { remote: repoInfo.remote, sha: repoInfo.sha },
    rules
  );
  await writeReport(contract, { ruleCount: rules.length });
  if (repoInfo.cleanup) await repoInfo.cleanup();
  console.log('Scan complete. Wrote repostyle.contract.yaml and repostyle.report.json');
};

export function scanCommand() {
  const cmd = new Command('scan')
    .argument('<pathOrUrl>', 'local path or GitHub URL')
    .option('--rev <sha>', 'git sha')
    .option('--max-files <n>', 'cap analysis', (v) => parseInt(v, 10))
    .option('--no-llm', 'disable LLM synthesis, signals-only', false)
    .action(executeScan);
  return cmd;
}
