import { Command } from 'commander';
import { loadContract } from '../core/contract.js';
import { writeAgentsMd } from '../reporters/agentsMd.js';

export function agentsCommand() {
  const cmd = new Command('agents')
    .option('--out <file>', 'output file', 'AGENTS.md')
    .action(async (opts) => {
      const contract = await loadContract();
      await writeAgentsMd(contract, opts.out);
      console.log(`Wrote ${opts.out}`);
    });
  return cmd;
}