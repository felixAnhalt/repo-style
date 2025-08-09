import { scanConfigs } from '../scanners/configScanner.js';
import { scanASTPython } from '../scanners/astScannerPy.js';
import { scanASTTs } from '../scanners/astScannerTs.js';
import { scanCI } from '../scanners/ciScanner.js';
import { materializeRepo } from '../utils/git.js';

export type Signal = {
  kind: string; // e.g., config.black, style.lineLength
  value: unknown;
  source: { path: string; lines: [number, number] };
  weight: number;
};

export async function scanRepository(opts: {
  pathOrUrl: string;
  rev?: string;
  maxFiles?: number;
}) {
  const repoInfo = await materializeRepo(opts.pathOrUrl, opts.rev);
  const root = repoInfo.path;
  const repo = { remote: repoInfo.remote, sha: repoInfo.sha };
  const signals = [
    ...(await scanConfigs(root)),
    ...(await scanASTPython(root, opts.maxFiles)),
    ...(await scanASTTs(root, opts.maxFiles)),
    ...(await scanCI(root))
  ];
  const metrics = { signalCount: signals.length };
  if (repoInfo.cleanup) await repoInfo.cleanup();
  return { repo, signals, metrics };
}
