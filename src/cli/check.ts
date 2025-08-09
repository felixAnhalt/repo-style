import { Command } from 'commander';
import { loadContract } from '../core/contract.js';
import { runChecks } from '../runtime/check.js';
import { writeSarif } from '../reporters/sarifWriter.js';

export function checkCommand() {
  const cmd = new Command('check')
    .option('--format <fmt>', 'json|sarif|table', 'table')
    .option('--fail-on <level>', 'warn|error', 'error')
    .action(async (opts) => {
      const contract = await loadContract();
      const result = await runChecks(contract);
      if (opts.format === 'sarif') await writeSarif(result.sarif);
      else if (opts.format === 'json') console.log(JSON.stringify(result.json, null, 2));
      else console.table(result.json.summary);
      if (result.json.hasViolations && opts.failOn !== 'none') process.exit(2);
    });
  return cmd;
}
