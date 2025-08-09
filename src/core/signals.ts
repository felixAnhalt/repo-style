import { scanConfigs } from '../scanners/configScanner.js';
import { scanASTPython } from '../scanners/astScannerPy.js';
import { scanASTTs } from '../scanners/astScannerTs.js';
import { scanCI } from '../scanners/ciScanner.js';

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
  // TODO: if URL is github://, clone shallow and resolve default branch + SHA via integrations/github
  const repo = { remote: isUrl(opts.pathOrUrl) ? opts.pathOrUrl : undefined, sha: 'HEAD' };
  const signals = [
    ...(await scanConfigs(opts.pathOrUrl)),
    ...(await scanASTPython(opts.pathOrUrl, opts.maxFiles)),
    ...(await scanASTTs(opts.pathOrUrl, opts.maxFiles)),
    ...(await scanCI(opts.pathOrUrl))
  ];
  const metrics = { signalCount: signals.length };
  return { repo, signals, metrics };
}

function isUrl(x: string) {
  try { new URL(x); return true; } catch { return false; }
}