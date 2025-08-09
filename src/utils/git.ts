import { execFile as _execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseGithubUrl, resolveDefaultBranch, resolveHeadSha } from '../integrations/github.js';

const execFile = promisify(_execFile);

export type RepoInfo = { path: string; remote?: string; sha: string; cleanup?: () => Promise<void> };

export async function materializeRepo(pathOrUrl: string, rev?: string): Promise<RepoInfo> {
  const gh = parseGithubUrl(pathOrUrl);
  if (!gh) {
    const sha = (await execFile('git', ['-C', pathOrUrl, 'rev-parse', rev ?? 'HEAD'])).stdout.trim();
    return { path: pathOrUrl, sha };
  }
  const tmp = await mkdtemp(join(tmpdir(), 'repostyle-'));
  const remote = `https://github.com/${gh.owner}/${gh.repo}.git`;
  const branch = await resolveDefaultBranch(gh.owner, gh.repo);
  const sha = rev ?? (await resolveHeadSha(gh.owner, gh.repo, branch));
  await execFile('git', ['clone', '--filter=tree:0', '--no-checkout', '--depth', '1', '--branch', branch, remote, tmp]);
  await execFile('git', ['-C', tmp, 'checkout', sha]);
  return { path: tmp, remote: `https://github.com/${gh.owner}/${gh.repo}`, sha, cleanup: () => rm(tmp, { recursive: true, force: true }) };
}
