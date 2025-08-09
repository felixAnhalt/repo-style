import { Octokit } from '@octokit/rest';

export function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return new Octokit(token ? { auth: token } : {});
}

// TODO: resolve default branch, head sha, PR comment helpers