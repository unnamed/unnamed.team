/*
 * Module dedicated to functions for the documentation
 * pages, which fetches, parses and shows our projects
 * documentation, taken from GitHub, there are some rules
 * to make a GitHub repository applicable for a documentation
 * webpage.
 *
 * These are:
 * - The GitHub repository must contain a 'docs' folder in
 *   the project main (root) folder
 *
 * - Documentation pages are markdown files (must end with
 *   '.md')
 *
 * - The main documentation page inside a folder must be
 *   named 'readme.md)
 *
 * See /pages/docs/[...slug].js file for more information
 */
import Cache from './cache';
import { markdownToHtml } from './markdown';
import { capitalize } from './string';

const API_URL = 'https://api.github.com';
const PAGE_SUFFIX = '.md';
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

function formatDirName(filename) {
  return capitalize(filename);
}

function formatFileName(filename, html) {
  for (const tag of [ 'h1', 'h2' ]) {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const start = html.indexOf(open) + open.length;
    const end = html.indexOf(close, start);

    if (start !== -1 && end !== -1) {
      // Found an user-provided title for
      // this section, use this
      return html.substring(start, end);
    }
  }

  return filename === MAIN_FILE_NAME
    ? MAIN_FILE_TITLE
    : capitalize(filename);
}

/**
 *
 * @param {string} repoFullName The repository full name,
 * including the repository owner, e.g. "unnamed/creative"
 * @returns {Promise<DocTree | null>}
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
        if (content.name.endsWith(PAGE_SUFFIX)) {
          const key = content.name.slice(0, -PAGE_SUFFIX.length);
          const html = await markdownToHtml(await (await fetch(content.download_url)).text());
          parent[key] = {
            type: 'file',
            name: formatFileName(key, html),
            htmlUrl: content.html_url,
            content: html
          };
        }
      } else {
        const newParent = {};
        await at(newParent, content.path);
        if (Object.entries(newParent).length > 0) {
          parent[content.name] = {
            type: 'dir',
            name: formatDirName(content.name),
            content: newParent
          };
        }
      }
    }

    return parent;
  }

  return await at({}, DOCS_FOLDER);
}

const MAIN_FILE_NAME = 'readme.md';
const MAIN_FILE_TITLE = 'Main';

/**
 * @typedef {NodeJS.Dict<string, DocNode>} DocTree
 */

/**
 * @typedef {DocTree | string} DocNode
 */

/**
 * Determines whether the given documentation
 * node is a content node (string)
 *
 * @param {DocNode} node The evaluated node
 * @returns {boolean} True if node is a string
 */
export function isContent(node) {
  return typeof node === 'string';
}

/**
 * Finds and returns the main content node
 * and its path inside the given tree, or null
 * if not found
 *
 * The main content node is a node with the
 * MAIN_FILE_NAME name, or the first content
 * node found
 *
 * @param {DocTree} tree The evaluated tree
 * @param {string[]} path The current path to the tree
 * @returns {[ string[], string ] | null} The found node,
 * where the first element is the node path, and the second
 * node is the content node
 */
export function findMainContentNode(tree, path = []) {

  // if there is a file with the wanted
  // main name, use it as first section
  const mainData = tree[MAIN_FILE_NAME];
  if (mainData) {
    return [ [ ...path, MAIN_FILE_NAME ], mainData ];
  }

  for (const [ name, node ] of Object.entries(tree)) {
    if (isContent(node)) {
      return [ [...path, MAIN_FILE_NAME ], node ];
    } else {
      const found = findMainContentNode(node, [ ...path, name ]);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Returns a pretty title name for the given
 * node. It returns a capitalized version of
 * the file name if the node is not a content
 * node. It returns the first occurrence of
 * text inside a H1 tag, or an H2 tag if an
 * H1 tag does not exist
 *
 * @param {string} filename The page file name
 * @param {DocNode} node The documentation tree node
 * @returns {string} The pretty title for this node
 */
export function titleOf(filename, node) {


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
