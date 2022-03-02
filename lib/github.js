// module holding functions for our GitHub integration
import fs from 'fs';
import path from 'path';

const API_URL = 'https://api.github.com';
const DOCS_FOLDER = 'docs';

/**
 * @typedef {Object} GitHubRepo
 * @property {string} fullName The repo full name (prefixed with the repo owner)
 * @property {string} name The repo name
 * @property {string} description The repo description
 * @property {number} stars The repo star count
 * @property {string} contents The contents URL
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
  const repos = await githubFetch(`/orgs/${organization}/repos`);
  const rawMembers = await githubFetch(`/orgs/${organization}/public_members`);
  const members = [];

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

  return {
    repos: repos.map(repo => ({
      fullName: repo.full_name,
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      contents: repo.contents_url
    })),
    members
  };
}

/**
 *
 * @param {GitHubRepo} repo
 * @returns {Promise<Object>}
 */
export async function fetchDocs(repo) {
  async function at(parent, path) {
    const contents = await githubFetch(`/repos/${repo.fullName}/contents/${path}`);

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
        parent[content.name] = newParent;
        await at(newParent, content.path);
        if (Object.entries(newParent).length === 0) {
          delete parent[content.name];
        }
      }
    }

    return parent;
  }

  return await at({}, DOCS_FOLDER);
}

export const fetchCache = {
  async find(name) {
    const data = fs.readFileSync(path.join(process.cwd(), 'ghcache.json'));
    const repos = JSON.parse(data);
    return repos[name];
  },
  async setAll(data) {
    fs.writeFileSync(
      path.join(process.cwd(), 'ghcache.json'),
      JSON.stringify(data)
    );
  }
};