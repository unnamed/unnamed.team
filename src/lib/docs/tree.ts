import { GitHubRepo } from "@/lib/github";

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
  content: string;
}

export interface DocDir extends DocNode {
  type: 'dir';
  content: DocTree;
}

export interface DocProject extends GitHubRepo {
  docs: DocTree;
}

const MAIN_KEYS = [ 'readme', 'getting-started' ];

export function findInTree(
  root: DocTree,
  path: string[],
  off = 0
): [ DocTree, DocFile ] {
  const remaining = path.length - off;
  if (remaining === 0) {
    for (const key of MAIN_KEYS) {
      const node = root[key];
      if (node) {
        return [root, node as DocFile];
      }
    }
    return [root, Object.values(root)[0] as DocFile];
  } else if (remaining === 1) {
    return [root, root[path[off]] as DocFile];
  } else {
    const sub = root[path[off]];
    if (sub.type === 'dir') {
      return findInTree(sub.content, path, off + 1);
    } else {
      return [root, sub];
    }
  }
}