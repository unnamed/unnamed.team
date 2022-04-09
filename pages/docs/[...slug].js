import Head from 'next/head';
import { useState } from 'react';
import * as GitHub from '../../lib/github';

import styles from './docs.module.scss';
import Header from '../../components/Header';
import clsx from 'clsx';
import { useRouter } from 'next/router';

const MAIN_KEYS = [ 'readme', 'getting-started' ];

function find(root, path, off = 0) {
  const remaining = path.length - off;
  if (remaining === 0) {
    for (const key of MAIN_KEYS) {
      const node = root[key];
      if (node) {
        return node;
      }
    }
    return Object.values(root)[0];
  } else if (remaining === 1) {
    return root[path[off]];
  } else {
    const sub = root[path[off]];
    if (sub.type === 'dir') {
      return find(sub.content, path, off + 1);
    } else {
      return sub;
    }
  }
}

function Sidebar({ children }) {
  return (
    <aside className="w-72 flex flex-col gap-4 py-9 px-6">
      {children}
    </aside>
  );
}

/**
 * Creates the elements for the given tree
 * node, will recurse to obtain a full element
 * tree for every sub-tree
 *
 * @returns {JSX.Element} The elements for the tree
 */
function NodeElement({ repo, tree, currentRoute, selected, onSelect }) {
  const router = useRouter();
  const indent = tree !== repo.docs;

  function compareNodeEntry(a, b) {
    const [ aKey, aNode ] = a;
    const [ bKey, bNode ] = b;
    if (aNode.type === 'dir') {
      if (bNode.type === 'file') {
        return 1;
      }
    }
    if (MAIN_KEYS.includes(bKey)) return 1;
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  }

  return (
    <ul className={clsx('flex flex-col gap-1', indent && 'gap-4')}>
      {Object.entries(tree).sort(compareNodeEntry).map(([ key, node ]) => {
        const newRoute = [ ...currentRoute, key ];

        if (node.type === 'file') {
          const isSelected = node === selected;
          return (
            <li
              key={key}
              className={clsx('flex flex-col gap-1', indent && 'pl-4')}
              onClick={() => {
                onSelect(node);
                router.push(
                  '/' + newRoute.join('/'),
                  undefined,
                  { shallow: true },
                );
              }}>
              <span
                className={clsx(
                  'text-base cursor-pointer',
                  isSelected ? 'font-normal text-pink-200' : 'font-light text-white/60',
                )}>
                {node.name}
              </span>
            </li>
          );
        }

        return (
          <li
            key={key}
            className={clsx(
              'flex flex-col gap-1 mt-4',
              indent && 'pl-4',
            )}>

            <span className="text-base font-normal text-white/80">{node.name}</span>

            <NodeElement
              repo={repo}
              tree={node.content}
              selected={selected}
              currentRoute={newRoute}
              onSelect={onSelect}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function Docs(props) {
  const repo = props.repo;
  const initialNode = find(repo.docs, [ ...props.path ]);

  const [ node, setNode ] = useState(initialNode);
  const [ sidebar, setSidebar ] = useState(false);

  return (
    <>
      <Head>
        <title>{repo.name} | Docs</title>
        <meta property="og:title" content={`${repo.name} | Documentation`}/>
        <meta property="og:url" content={`https://unnamed.team/docs/${repo.name}`}/>
        <meta property="og:description" content={`${repo.description}`}/>
      </Head>
      <div className="h-screen overflow-y-hidden">
        <Header/>

        <div className="flex flex-row justify-between max-w-8xl mx-auto h-full">
          {/* Navigation */}
          <Sidebar>
            <div className="p-2.5">
              <NodeElement
                repo={repo}
                tree={repo.docs}
                currentRoute={[ 'docs', repo.name ]}
                selected={node}
                onSelect={setNode}
              />
            </div>
          </Sidebar>

          {/* Content */}
          <div className={clsx('flex-1 h-full', sidebar ? 'hidden sm:flex' : 'flex')}>
            <div className="flex flex-col container mx-auto px-4 py-8 h-full overflow-y-scroll">
              <div
                className={clsx('text-white/60 font-light', styles.body)}
                dangerouslySetInnerHTML={{ __html: node.content }}
              />

              <footer
                className="flex flex-row justify-between font-light text-white/50 py-8 my-12">
                <span>Copyright &copy; {new Date().getFullYear()} Unnamed Team</span>
                <span className="hover:text-white/70">
                  <a href={node.htmlUrl}>Edit this page on GitHub</a>
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const data = await GitHub.cache.get();
  const paths = [];

  function addPath(path) {
    paths.push({
      params: {
        slug: path,
      },
    });
  }

  for (const repo of data.repos) {

    if (repo.docs === null) {
      // no docs for this repo
      continue;
    }

    // root path
    addPath([ repo.name ]);

    // section paths
    async function it(key, tree, path) {
      if (tree.type === 'file') {
        addPath([ ...path, key ]);
      } else {
        for (const [ childKey, childNode ] of Object.entries(tree.content)) {
          await it(childKey, childNode, [ ...path, key ]);
        }
      }
    }

    for (const [ key, tree ] of Object.entries(repo.docs)) {
      await it(key, tree, [ repo.name ]);
    }
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {

  const data = await GitHub.cache.get();
  const [ project, ...path ] = params.slug;
  const repo = data.repos.find(r => r.name === project);
  return {
    props: {
      repo,
      path,
    },
  };
}