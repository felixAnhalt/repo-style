import { describe, it, expect } from 'vitest';

describe('scaffold', () => {
  it('loads', () => {
    expect(1 + 1).toBe(2);
  });
});
import { executeScan } from '../src/cli/scan.js';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { loadContract } from '../src/core/contract';
import { writeAgentsMd } from '../src/reporters/agentsMd';

describe('executeScan', () => {
  it('generates a contract with rules for a sample repo', async () => {
    const repoPath = '.';
    await executeScan(repoPath, {});

    expect(existsSync('repostyle.contract.yaml')).toBe(true);
    const contract = await readFile('repostyle.contract.yaml', 'utf8');
    expect(contract).toMatch(/rules:/);
  });
}, {
  timeout: 1000000
});

describe('writeAgentsMD', () => {
  it('writes agents.md with expected content', async () => {
    const contract = await loadContract();
    await writeAgentsMd(contract, "AGENTS.md");
    // read the generated file
    const content = await readFile('AGENTS.md', 'utf8');
    // check for expected sections
    expect(content).toContain('## Agents');
    expect(content).toContain('### LLM Agent');
  });
}
, {
  timeout: 1000000
});
