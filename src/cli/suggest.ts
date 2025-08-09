import { Command } from 'commander';
import { loadContract } from '../core/contract.js';
import { suggest } from '../runtime/suggest.js';

export function suggestCommand() {
  const cmd = new Command('suggest')
    .option('--apply', 'write changes', false)
    .option('--dry-run', 'print diffs only', true)
    .action(async (opts) => {
      const contract = await loadContract();
      await suggest(contract, { apply: !!opts.apply, dryRun: !!opts.dryRun });
    });
  return cmd;
}