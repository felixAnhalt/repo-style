import { Command } from 'commander';
import { writeFile } from 'node:fs/promises';

const WORKFLOW = `name: repostyle-verify
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build || true
      - run: node dist/index.js scan .
      - run: node dist/index.js check --format sarif || true
      - uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: results.sarif }
`;

export function ciInitCommand() {
  const cmd = new Command('ci').command('init').option('--apply', 'write workflow').action(async (o) => {
    const path = '.github/workflows/repostyle.yml';
    if (o.apply) {
      await writeFile(path, WORKFLOW, 'utf8');
      console.log(`Wrote ${path}`);
    } else {
      console.log(WORKFLOW);
    }
  });
  return cmd.parent!;
}