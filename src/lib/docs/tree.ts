import { GitHubRepo } from "@/lib/github";
import { NextRouter } from "next/router";

export interface DocTree {
  [ key: string ]: DocFile | DocDir
}

export interface DocNode {
  type: 'dir' | 'file';
  name: string;
}

export interface DocFile extends DocNode {
  type: 'file';
  htmlUrl: string;
  path: string[];
  content: string;
}

export interface DocDir extends DocNode {
  type: 'dir';
  content: DocTree;
}

export interface DocProject extends GitHubRepo {
  docs: DocTree;
}

export function pathOf(project: DocProject, file: DocFile) {
  return `/docs/${project.name}/${file.path.join('/')}`;
}

export async function openDocFile(router: NextRouter, project: DocProject, file: DocFile) {
  return router.push(
    pathOf(project, file as DocFile),
    undefined,
    { shallow: true, scroll: true },
  );
}

export function findInTree(
  root: DocTree,
  path: string[]
): DocFile | null {
  let current = root;
  let off = 0;
  while (off < path.length) {
    let currentKey = path[off++];
    let node = current[currentKey];

    if (!node) {
      return null;
    } else if (node.type === 'file') {
      return node;
    } else {
      current = node.content;
    }
  }

  // ended in a directory, return the first
  // file inside this directory
  return Object.values(current).find(k => k.type === 'file') as DocFile ?? null;
}