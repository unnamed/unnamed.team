import * as GitHub from "@/lib/docs/index";

const MAIN_KEYS = [ 'readme', 'getting-started' ];

export function findInTree(
  root: GitHub.DocTree,
  path: string[],
  off = 0
): [ GitHub.DocTree, GitHub.DocFile ] {
  const remaining = path.length - off;
  if (remaining === 0) {
    for (const key of MAIN_KEYS) {
      const node = root[key];
      if (node) {
        return [root, node as GitHub.DocFile];
      }
    }
    return [root, Object.values(root)[0] as GitHub.DocFile];
  } else if (remaining === 1) {
    return [root, root[path[off]] as GitHub.DocFile];
  } else {
    const sub = root[path[off]];
    if (sub.type === 'dir') {
      return findInTree(sub.content, path, off + 1);
    } else {
      return [root, sub];
    }
  }
}