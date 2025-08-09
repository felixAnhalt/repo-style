import { Command } from 'commander';
import { scanCommand } from './scan.js';
import { agentsCommand } from './agents.js';
import { checkCommand } from './check.js';
import { suggestCommand } from './suggest.js';
import { ciInitCommand } from './ci.js';

const program = new Command();
program
  .name('repostyle')
  .description('Infer repo conventions; emit AGENTS.md and check compliance')
  .version('0.1.0');

program.addCommand(scanCommand());
program.addCommand(agentsCommand());
program.addCommand(checkCommand());
program.addCommand(suggestCommand());
program.addCommand(ciInitCommand());

program.parseAsync(process.argv);
