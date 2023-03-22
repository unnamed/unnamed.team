import Head from 'next/head';
import { useEffect, useState } from 'react';
import * as GitHub from '../../lib/docs';

import styles from './docs.module.scss';
import Header from '../../components/Header';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { GetStaticProps } from "next";

const MAIN_KEYS = [ 'readme', 'getting-started' ];

function find(root: GitHub.DocTree, path: string[], off = 0): [ GitHub.DocTree, GitHub.DocFile ] {
  const remaining = path.length - off;
  if (remaining === 0) {
    for (const key of MAIN_KEYS) {
      const node = root[key];
      if (node) {
        return [ root, node as GitHub.DocFile ];
      }
    }
    return [ root, Object.values(root)[0] as GitHub.DocFile ];
  } else if (remaining === 1) {
    return [ root, root[path[off]] as GitHub.DocFile ];
  } else {
    const sub = root[path[off]];
    if (sub.type === 'dir') {
      return find(sub.content, path, off + 1);
    } else {
      return [ root, sub ];
    }
  }
}

interface NodeElementProps {
  repo: GitHub.GitHubRepo;
  tree: GitHub.DocTree;
  currentRoute: string[];
  selected: GitHub.DocFile;
  onSelect: (node: GitHub.DocFile) => void
}

/**
 * Creates the elements for the given tree
 * node, will recurse to obtain a full element
 * tree for every sub-tree
 *
 * @returns {JSX.Element} The elements for the tree
 */
function NodeElement({ repo, tree, currentRoute, selected, onSelect }: NodeElementProps) {
  const router = useRouter();
  const indent = tree !== repo.docs;

  const fileChildren = Object.entries(tree).filter(([ _, node ]) => node.type === 'file');
  const dirChildren = Object.entries(tree).filter(([ _, node ]) => node.type === 'dir');

  return (
    <ul className={clsx('flex flex-col gap-2', indent && 'gap-4')}>
      {fileChildren.map(([ key, node ]) => {
        return (
          <li
            key={key}
            className={clsx('flex flex-col gap-1', indent && 'pl-4')}
            onClick={() => {
              onSelect(node as GitHub.DocFile);
              router.push(
                '/' + currentRoute.join('/') + '/' + key,
                undefined,
                { shallow: true },
              ).catch(console.error);
            }}>
            <span
              className={clsx(
                'text-base cursor-pointer',
                node === selected ? 'font-normal text-pink-200' : 'font-light text-white/60',
              )}>
              {node.name}
            </span>
          </li>
        );
      })}
      {dirChildren.map(([ key, node ]) => (
        <li
          key={key}
          className={clsx(
            'flex flex-col gap-1 mt-4',
            indent && 'pl-4',
          )}>

          <span className="text-base font-normal text-white/80">{node.name}</span>

          <NodeElement
            repo={repo}
            tree={node.content as GitHub.DocTree}
            selected={selected}
            currentRoute={[ ...currentRoute, key ]}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

interface PageProps {
  repo: GitHub.GitHubRepo;
  path: string[];
}

export default function Docs(props: PageProps) {
  const repo = props.repo;
  const [ currentTree, initialNode ] = find(repo.docs, [ ...props.path ]);

  const [ node, setNode ] = useState<GitHub.DocFile>(initialNode);
  const [ sidebar, setSidebar ] = useState(false);

  const [ previous, setPrevious ] = useState<GitHub.DocFile | null>(null);
  const [ next, setNext ] = useState<GitHub.DocFile | null>(null);

  useEffect(() => {
    let _previous = null;
    let _next = null;
    let found = false;
    for (const val of Object.values(currentTree)) {
      if (val.type !== 'file') {
        // TODO:
        continue;
      }
      if (found) {
        _next = val;
        break;
      }
      if (val.name === node.name) {
        found = true;
        continue;
      }
      _previous = val;
    }

    setPrevious(_previous);
    setNext(_next);
  }, [ node ]);

  return (
    <>
      <Head>
        <title>{`${repo.name} | Docs`}</title>
        <meta property="og:title" content={`${repo.name} | Documentation`}/>
        <meta property="og:url" content={`https://unnamed.team/docs/${repo.name}`}/>
        <meta property="og:description" content={`${repo.description}`}/>
      </Head>
      <div className="flex flex-col h-full w-full">

        {/* Fixed header */}
        <Header
          className="fixed bg-wine-900/80 backdrop-blur-sm z-50"
        />
        {/* Fixed container, contains header and sidebars */}
        <div className="fixed w-screen h-screen">
          <div className="max-w-5xl mx-auto">
            {/* Navigation */}
            <aside className="max-w-[256px] flex flex-col p-4 gap-4 z-50 mt-16">
              <div className="p-2.5">
                <NodeElement
                  repo={repo}
                  tree={repo.docs}
                  currentRoute={[ 'docs', repo.name ]}
                  selected={node}
                  onSelect={selected => {
                    setSidebar(false);
                    setNode(selected);
                  }}
                />
              </div>
            </aside>
          </div>
        </div>


        <div className="w-screen h-full">
          <div className="max-w-5xl mx-auto flex flex-row justify-end mt-16">
            {/* Content */}
            <main className="max-w-[768px] flex z-10">
              <div className="flex flex-col mx-auto">
                <div
                  className={clsx('text-white/60 font-light w-full', styles.body)}
                  dangerouslySetInnerHTML={{ __html: node.content }}
                />

                <div className="flex flex-row justify-between mt-12 text-white/70">
                  <span>
                    {previous && (<span className="cursor-pointer hover:text-white/90">
                      &lt; {previous.name}
                    </span>)}
                  </span>
                  <span>
                    {next && (<span className="cursor-pointer hover:text-white/90">
                      {next.name} &gt;
                    </span>)}
                  </span>
                </div>

                <footer className="flex flex-row justify-between font-light text-white/40 py-8 my-12">
                  <span>Copyright &copy; 2021-{new Date().getFullYear()} Unnamed Team</span>
                  <span className="hover:text-white/60">
                    <a href={node.htmlUrl}>Edit this page on GitHub</a>
                  </span>
                </footer>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const repos: GitHub.GitHubRepos = await GitHub.cache.get();
  const paths: any[] = [];

  function addPath(path: string[]) {
    paths.push({
      params: {
        slug: path,
      },
    });
  }

  async function it(key: string, tree: GitHub.DocNode, path: string[]) {
    if (tree.type === 'file') {
      addPath([ ...path, key ]);
    } else {
      for (const [ childKey, childNode ] of Object.entries((tree as GitHub.DocDir).content)) {
        await it(childKey, childNode, [ ...path, key ]);
      }
    }
  }

  for (const repo of Object.values(repos)) {

    // root path
    addPath([ repo.name ]);

    // section paths
    for (const [ key, tree ] of Object.entries(repo.docs)) {
      await it(key, tree, [ repo.name ]);
    }
  }

  return {
    paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const repos = await GitHub.cache.get();
  const [ project, ...path ] = params!['slug'] as string[];
  const repo = repos[project];
  return {
    props: {
      repo,
      path,
    },
  };
};