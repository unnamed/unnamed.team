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
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { capitalize } from './string';

const PAGE_SUFFIX = '.md';
const ROOT_FOLDER = 'docs';
const API_URL = 'https://api.github.com';
const TITLES = {
  'readme.md': 'Read Me',
  'getting-started.md': 'Getting Started'
};

/**
 * @typedef {Node.Dict<DocFile | DocDir>} DocTree
 */

/**
 * @typedef {Object} DocNode
 * @property {'dir' | 'file'} type The node type
 * @property {string} name The node name
 */

/**
 * @typedef {DocNode} DocFile
 * @property {'file'} type
 * @property {string} htmlUrl
 * @property {string} content
 */

/**
 * @typedef {DocNode} DocDir
 * @property {'dir'} type
 * @property {DocTree} content
 */

/**
 * @typedef {Object} GitHubRepo
 * @property {string} fullName The repo full name (prefixed with the repo owner)
 * @property {string} name The repo name
 * @property {string} description The repo description
 * @property {DocTree} docs The repo documentation tree
 */

/**
 * @typedef {Node.Dict<GitHubRepo>} GitHubRepos
 */

/**
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
 * @returns {Promise<GitHubRepos>} The fetch github data
 */
export async function fetchGitHubData(organization) {
  const rawRepos = await githubFetch(`/orgs/${organization}/repos`);

  /** @type {GitHubRepos} */
  const repos = {};

  for (const raw of rawRepos) {
    const repo = {
      name: raw.name,
      fullName: raw.full_name,
      description: raw.description,
    };
    await fetchDocs(repo);
    if (repo.docs) {
      console.log(`[INFO] Discovered documented repository \`${repo.name}\``);
      repos[repo.name] = repo;
    }
  }

  return repos;
}

/**
 * Fetch the documentation for a given GitHub repository
 *
 * @param {GitHubRepo} repo The repository partial object,
 */
export async function fetchDocs(repo) {

  const basePath = `/${ROOT_FOLDER}/${repo.name}`;
  let currPath = '/';

  const repoFullName = repo.fullName;

  function rehypeRewriteLinks() {
    return tree => {
      // based on https://github.com/unifiedjs/unifiedjs.github.io/blob/main/generate/plugin/rehype-rewrite-urls.js
      visit(tree, 'element', node => {
        if (node.tagName === 'a') {
          const ref = node.properties.href;
          if (ref !== undefined && ref !== null && !ref.startsWith('https://') && ref.endsWith(PAGE_SUFFIX)) {
            const rawPath = ref.slice(0, -PAGE_SUFFIX.length);
            const path = new URL(rawPath, 'https://example.com' /* base doesn't really matter*/).pathname;
            node.properties.href = basePath + currPath + path;
          }
        }
      });
    };
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeRewriteLinks)
    .use(rehypeStringify);

  async function parse(markdown) {
    return String(await processor.process(markdown));
  }

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
          currPath = path.substring(Math.min(ROOT_FOLDER.length, path.length));
          const html = await parse(await (await fetch(content.download_url)).text());
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
            name: capitalize(content.name),
            content: newParent
          };
        }
      }
    }

    return parent;
  }

  repo.docs = await at({}, ROOT_FOLDER);
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

  return TITLES[filename] ?? capitalize(filename);
}