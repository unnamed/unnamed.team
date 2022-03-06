// module holding functions for our GitHub integration
import Cache from './cache';

const API_URL = 'https://api.github.com';
export const DOCS_FOLDER = 'docs';

/**
 * @typedef {Object} GitHubRepo
 * @property {string} fullName The repo full name (prefixed with the repo owner)
 * @property {string} name The repo name
 * @property {string} description The repo description
 * @property {number} stars The repo star count
 * @property {string} defaultBranch The repo default branch
 * @property {DocTree | null} docs The repo documentation tree
 */

/**
 * @typedef {Object} GitHubUser
 * @property {string} login The user login
 * @property {string | null} name The user name
 * @property {string} avatar The user avatar URL
 * @property {string | null} bio The user bio
 * @property {string} html The user HTML url
 */

/**
 * @typedef {Object} GitHubData
 * @property {GitHubRepo[]} repos
 * @property {GitHubUser[]} members
 */

/**
 *
 * @param {string} endpoint The endpoint, appended
 * to API_URL constant
 * @return {Promise<unknown>} The fetch data
 */
async function githubFetch(endpoint) {
  const accessToken = process.env.GITHUB_ACCESS_TOKEN;
  const url = API_URL + endpoint;
  const response = accessToken ? (await fetch(url, { headers: { Authorization: `token ${accessToken}` } })) : (await fetch(url));
  return await response.json();
}

/**
 * @param {string} organization The organization slug or username
 * @returns {Promise<GitHubData>} The fetch github data
 */
export async function fetchGitHubData(organization) {
  const rawRepos = await githubFetch(`/orgs/${organization}/repos`);
  const rawMembers = await githubFetch(`/orgs/${organization}/public_members`);
  const members = [];
  const repos = [];

  for (const raw of rawMembers) {
    const extendedUserData = await githubFetch(`/users/${raw.login}`);
    members.push({
      login: raw.login,
      name: extendedUserData.name,
      bio: extendedUserData.bio,
      avatar: raw.avatar_url,
      html: raw.html_url
    });
  }

  for (const raw of rawRepos) {
    const docs = await fetchDocs(raw.full_name);
    repos.push({
      name: raw.name,
      fullName: raw.full_name,
      description: raw.description,
      stars: raw.stargazers_count,
      defaultBranch: raw.default_branch,
      docs
    });
  }

  return { repos, members };
}

/**
 *
 * @param {string} repoFullName The repository full name,
 * including the repository owner, e.g. "unnamed/creative"
 * @returns {Promise<Object | null>}
 */
export async function fetchDocs(repoFullName) {
  async function at(parent, path) {
    const contents = await githubFetch(`/repos/${repoFullName}/contents/${path}`);

    if (contents.message === 'Not Found') {
      return Promise.resolve(null);
    }

    for (const content of contents) {
      const type = content.type;
      if (type === 'file') {
        if (content.name.endsWith('.md')) {
          parent[content.name] = await (await fetch(content.download_url)).text();
        }
      } else {
        const newParent = {};
        await at(newParent, content.path);
        if (Object.entries(newParent).length > 0) {
          parent[content.name] = newParent;
        }
      }
    }

    return parent;
  }

  return await at({}, DOCS_FOLDER);
}

/**
 *
 * @type {Cache<GitHubData>}
 */
export const cache = new Cache(
  async () => await fetchGitHubData(process.env.githubSlug),
  'github',
  1000 * 60 * 5, // 5 minutes
);
