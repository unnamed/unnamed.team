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
 * See /pages/docs/[project].js file for more information
 */
import { capitalize } from './string';
import { markdownToHtml } from './markdown';

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

  if (!isContent(node)) {
    return capitalize(filename);
  }

  for (const tag of [ 'h1', 'h2' ]) {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const start = node.indexOf(open) + open.length;
    const end = node.indexOf(close, start);

    if (start !== -1 && end !== -1) {
      // Found an user-provided title for
      // this section, use this
      return node.substring(start, end);
    }
  }

  return filename === MAIN_FILE_NAME
    ? MAIN_FILE_TITLE
    : capitalize(filename);
}

/**
 * Converts the given documentation tree to HTML,
 * i.e. parses the markdown from every content node
 * and converts it to HTML, and sets it again, this
 * mutates the tree
 *
 * @param {DocTree} tree The tree to convert to HTML
 * @returns {Promise<void>}
 */
export async function toHtml(tree) {
  for (const [ filename, node ] of Object.entries(tree)) {
    if (isContent(node)) {
      tree[filename] = await markdownToHtml(node);
    } else {
      await toHtml(node);
    }
  }
}