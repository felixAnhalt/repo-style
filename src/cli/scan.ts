import { Command } from 'commander';
import { scanRepository } from '../core/signals.js';
import { synthesizeRules } from '../core/synthesize.js';
import { writeContract } from '../reporters/yamlWriter.js';
import { writeReport } from '../reporters/jsonWriter.js';

export function scanCommand() {
  const cmd = new Command('scan')
    .argument('<pathOrUrl>', 'local path or GitHub URL')
    .option('--rev <sha>', 'git sha')
    .option('--max-files <n>', 'cap analysis', (v) => parseInt(v, 10))
    .option('--no-llm', 'disable LLM synthesis, signals-only')
    .action(async (pathOrUrl, opts) => {
      const signals = await scanRepository({ pathOrUrl, rev: opts.rev, maxFiles: opts.maxFiles });
      const rules = await synthesizeRules(signals, { useLLM: !!opts.llm });
      const contract = await writeContract(signals.repo, rules);
      await writeReport(contract, signals.metrics);
      console.log('Scan complete. Wrote repostyle.contract.yaml and repostyle.report.json');
    });
  return cmd;
}
