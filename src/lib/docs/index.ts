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
 * See /pages/docs/[...slug].tsx file for more information
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { capitalize, replaceAsync, trimArray } from '@/lib/string';
import Cache from '@/lib/cache';
import { DocDir, DocFile, DocProject, DocTree } from "@/lib/docs/tree";
import { getPageTitle } from "@/lib/docs/title";
import { fetchFromGitHub, fetchGitHubOrganizationRepositories } from "@/lib/github";
import { fetchVersioning } from "@/lib/nexus.versions";

const INDEX_FILE_NAME = 'index.txt';
const PAGE_SUFFIX = '.md';
const ROOT_FOLDER = 'docs';

export type DocProjects = {
  [ name: string ]: DocProject;
};

export async function fetchProjects(): Promise<DocProjects> {
  const projects: DocProjects = {};

  for (const repo of await fetchGitHubOrganizationRepositories(process.env.githubSlug!)) {
    const project: DocProject = { ...repo, docs: {} };
    await fetchDocs(project);
    if (Object.entries(project.docs.latest).length > 0) {
      console.log(`[INFO] Discovered documented project \`${project.name}\``);
      projects[project.name] = project;
    }
  }

  return projects;
}

/**
 * Fetch the documentation for a given GitHub repository
 *
 * @param {DocProject} repo The repository partial object,
 */
async function fetchDocs(repo: DocProject) {

  // find all tags for this repo
  let tags: any[] = await fetchFromGitHub(`/repos/${repo.fullName}/tags`);
  tags = tags.filter(tag => !tag.name.endsWith('-SNAPSHOT')); // we only want releases

  const basePath = `/${ROOT_FOLDER}/${repo.name}`;
  let currPath = '/';

  const repoFullName = repo.fullName;

  function rehypeRewriteLinks() {
    return (tree: any) => {
      // based on https://github.com/unifiedjs/unifiedjs.github.io/blob/main/generate/plugin/rehype-rewrite-urls.js
      visit(tree, 'element', node => {
        if (node.tagName === 'a') {
          const ref = node.properties.href;
          if (ref !== undefined && ref !== null && !ref.startsWith('https://') && ref.endsWith(PAGE_SUFFIX)) {
            const rawPath = ref.slice(0, -PAGE_SUFFIX.length);
            const path = new URL(rawPath, 'https://example.com' /* base doesn't really matter*/).pathname;
            node.properties.href = basePath + currPath + path;
          }
        } else if (node.tagName === 'img') {
          // rewrite image src's
          const src = node.properties.src;
          if (src !== undefined && src !== null && !src.startsWith('https://')) {
            const path = new URL(src, 'https://example.com').pathname;
            node.properties.src = `https://github.com/${repo.fullName}/raw/${repo.defaultBranch}/${path}`;
          }
        }
      });
    };
  }

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHighlight, { ignoreMissing: true })
    .use(rehypeRewriteLinks)
    .use(rehypeStringify as any);

  async function parseAndProcessMarkdown(markdown: string) {
    // format is like:
    //   %%REPLACE_what{the_argument}%%
    // for example:
    //   %%REPLACE_latestRelease{team.unnamed:creative-central-api}%%
    const latestVersionRegex = /%%REPLACE_([^%]+)\{([^%]+)}%%/g;

    markdown = await replaceAsync(markdown, latestVersionRegex, async (match, whatToReplace, argument) => {
      if (whatToReplace === 'latestRelease' || whatToReplace === 'latestVersion' || whatToReplace === 'latestReleaseOrSnapshot') {
        const [ groupId, artifactId ] = argument.split(':');
        const versioning = await fetchVersioning(groupId, artifactId);

        if (whatToReplace === 'latestRelease') {
          return versioning.release ?? 'unknown';
        } else if (whatToReplace === 'latestVersion') {
          return versioning.latest;
        } else {
          return versioning.release ?? versioning.latest;
        }
      } else {
        return match;
      }
    });

    return String(await processor.process(markdown));
  }

  async function at(parent: DocTree, path: string, ref?: string): Promise<DocTree | null> {
    const contents = await fetchFromGitHub(`/repos/${repoFullName}/contents/${path}${ref ? `?ref=${ref}` : ''}`);

    if (contents.message === 'Not Found') {
      return Promise.resolve(null);
    }

    const entries: Array<[ string, DocFile | DocDir ]> = [];
    let index: string[] | null = null;

    for (const content of contents) {
      const type = content.type;
      if (type === 'file') {
        if (content.name === INDEX_FILE_NAME) {
          const txt = await (await fetch(content.download_url)).text();
          index = txt.split(/\r?\n/g).map(name => name.trim());
        } else if (content.name.endsWith(PAGE_SUFFIX)) {
          // found a file that ends with .md, must be a documentation page
          const key = content.name.slice(0, -PAGE_SUFFIX.length);
          currPath = path.substring(Math.min(ROOT_FOLDER.length, path.length));

          const directoryPath = currPath.split('/');
          trimArray(directoryPath);

          const html = await parseAndProcessMarkdown(await (await fetch(content.download_url)).text());

          // fetch the last commit information for this file
          const commits = await fetchFromGitHub(`/repos/${repoFullName}/commits?path=${content.path}&per_page=1${ref ? `&sha=${ref}` : ''}}`);
          const lastUpdateDate = commits.length > 0 ? commits[0].commit.committer.date : 'unknown';

          entries.push([
            content.name,
            {
              type: 'file',
              name: getPageTitle(key, html),
              path: [ ...directoryPath, key ],
              htmlUrl: content.html_url,
              content: html,
              lastUpdateDate,
            } as DocFile
          ]);
        }
      } else {
        const newParent = {};
        await at(newParent, content.path);
        if (Object.entries(newParent).length > 0) {
          entries.push([
            content.name,
            {
              type: 'dir',
              name: capitalize(content.name),
              content: newParent
            } as DocDir
          ]);
        }
      }
    }

    if (index) {
      // if there is an index defined, use it
      entries.sort(([ aKey ], [ bKey ]) => {
        const leftFirst = 1, rightFirst = -1, equal = 0;
        const aIndex = index!.indexOf(aKey);
        const bIndex = index!.indexOf(bKey);
        if (aIndex !== -1) {
          if (bIndex !== -1) {
            return aIndex - bIndex;
          } else {
            return leftFirst;
          }
        } else {
          if (bIndex !== -1) {
            return rightFirst;
          } else {
            if (aKey > bKey) return leftFirst;
            if (bKey < aKey) return rightFirst;
            return equal;
          }
        }
      });
    }

    for (const [ key, node ] of entries) {
      if (node.type === 'file') {
        const nameWithoutExt = key.slice(0, -PAGE_SUFFIX.length);
        parent[nameWithoutExt] = node;
      } else {
        parent[key] = node;
      }
    }

    return parent;
  }

  if (tags.length === 0) {
    // repo has no tags
    repo.docs = {
      latest: await at({}, ROOT_FOLDER) || {}
    };
  } else {
    // repo has tags
    repo.docs = {};
    for (const tag of tags) {
      const found = await at({}, ROOT_FOLDER, tag.name);
      if (found !== null) {
        repo.docs[tag.name] = found;
      }
    }
    repo.docs.latest = repo.docs[tags[0].name] || Object.values(repo.docs)[0] || await at({}, ROOT_FOLDER) || {};
  }
}


export const cache = new Cache<DocProjects>(
  fetchProjects,
  'github',
  1000 * 60 * 5, // 5 minutes
);