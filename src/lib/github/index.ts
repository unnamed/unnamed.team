const API_URL = 'https://api.github.com';

export interface GitHubRepo {
  fullName: string;
  name: string;
  description: string;
  stars: number;
  defaultBranch: string;
}

export async function fetchGitHubOrganizationRepositories(organization: string): Promise<GitHubRepo[]> {
  const rawRepos = await fetchFromGitHub(`/orgs/${organization}/repos`);
  const repos: GitHubRepo[] = [];

  for (const raw of rawRepos) {
    repos.push({
      name: raw.name,
      fullName: raw.full_name,
      description: raw.description,
      stars: raw.watchers,
      defaultBranch: raw.default_branch
    });
  }

  return repos;
}

/**
 * @param {string} endpoint The endpoint, appended
 * to API_URL constant
 * @return {Promise<any>} The fetch data
 */
export async function fetchFromGitHub(endpoint: string): Promise<any> {
  const accessToken = process.env.GITHUB_ACCESS_TOKEN;
  const url = API_URL + endpoint;
  const response = accessToken ? (await fetch(url, { headers: { Authorization: `token ${accessToken}` } })) : (await fetch(url));
  return await response.json();
}