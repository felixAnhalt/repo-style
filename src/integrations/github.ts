import { Octokit } from '@octokit/rest';
import { GITHUB_TOKEN, GH_TOKEN } from '../env.js';

export function getOctokit(): Octokit {
  const token = GITHUB_TOKEN || GH_TOKEN;
  return new Octokit(token ? { auth: token } : {});
}

export async function resolveDefaultBranch(owner: string, repo: string): Promise<string> {
  const octo = getOctokit();
  const { data } = await octo.repos.get({ owner, repo });
  return data.default_branch ?? 'main';
}

export async function resolveHeadSha(owner: string, repo: string, branch: string): Promise<string> {
  const octo = getOctokit();
  const { data } = await octo.repos.getBranch({ owner, repo, branch });
  return data.commit.sha;
}

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return null;
    const [owner, repo] = u.pathname.replace(/^\//, '').split('/');
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, '') };
  } catch {
    return null;
  }
}
