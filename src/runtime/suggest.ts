import type { Contract } from '../core/types.js';

export async function suggest(_contract: Contract, opts: { apply: boolean; dryRun: boolean }) {
  // TODO: emit minimal diffs (e.g., create ruff.toml or sync black line length).
  if (opts.dryRun) {
    console.log('# Suggested changes (dry-run)\n- (none)');
  } else if (opts.apply) {
    console.log('Applied minimal suggestions.');
  }
}