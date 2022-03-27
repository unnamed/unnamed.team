import Head from 'next/head';
import { useState } from 'react';
import Background from '../../components/Background';
import * as GitHub from '../../lib/github';

import styles from './docs.module.scss';
import Header from '../../components/Header';
import clsx from 'clsx';
import { useRouter } from 'next/router';

function find(root, path) {
  if (path.length === 0) {
    return root['readme'] ?? root['getting-started'] ?? Object.values(root)[0];
  } else if (path.length === 1) {
    return root[path[0]];
  } else {
    const sub = root[path.shift()];
    if (sub.type === 'dir') {
      return find(sub.content, path);
    } else {
      return null;
    }
  }
}

export default function Docs(props) {
  const repo = props.repo;
  const initialPath = props.path;
  const initialNode = find(repo.docs, initialPath);

  const router = useRouter();
  const [ node, setNode ] = useState(initialNode);
  const [ sidebar, setSidebar ] = useState(false);

  /**
   * Creates the elements for the given tree
   * node, will recurse to obtain a full element
   * tree for every sub-tree
   *
   * @returns {JSX.Element} The elements for the tree
   */
  function createNodeElement(holder, currentRoute) {
    const indent = holder !== repo.docs;
    return (
      <ul className={clsx('flex flex-col gap-1', indent && 'gap-4')}>
        {Object.entries(holder).map(([ key, _node ]) => {
          const isContent = _node.type === 'file';
          const isSelected = _node === node;
          const newRoute = [ ...currentRoute, key ];

          return (
            <li
              className={clsx(
                'flex flex-col gap-1',
                indent && 'pl-4',
                isContent && indent && 'border-l border-gray-100 hover:border-gray-300',
                isSelected && indent && 'border-pink-200 hover:border-pink-200'
              )}
              key={key}
              onClick={() => {
                if (isContent) {
                  setNode(_node);
                  router.push({
                      pathname: `/${newRoute.join('/')}`,
                    },
                    undefined,
                    { shallow: true }
                  );
                }
              }}>

            <span
              className={clsx(
                isContent ? 'font-light cursor-pointer' : 'font-normal text-wine-900 dark:text-lightghost-200',
                isSelected ? 'text-pink-200 font-normal' : (isContent && 'text-gray-700 dark:text-lightghost-100')
              )}>
              {_node.name}
            </span>
              {isContent || createNodeElement(_node.content, newRoute)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <>
      <Head>
        <title>{repo.name} | Docs</title>
        <meta property="og:title" content={`${repo.name} | Documentation`}/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={`https://unnamed.team/docs/${repo.name}`}/>
        <meta property="og:description" content={`${repo.description}`}/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>
      <Background className="h-screen overflow-y-hidden">
        <Header />

        <div className="flex flex-row justify-between max-w-8xl mx-auto h-full">
          <aside className={`w-72 flex flex-col gap-4 py-9 px-6`}>
            <h1 className="text-wine-900 dark:text-lightghost-200">{repo.name} Documentation</h1>
            {createNodeElement(repo.docs, [ 'docs', repo.name ])}
          </aside>

          <div className={clsx('flex-1 h-full', sidebar ? 'hidden sm:flex' : 'flex')}>
            <div className="flex flex-col container mx-auto px-4 py-8 h-full overflow-y-scroll">
              <div
                className={clsx('text-gray-800 font-light dark:text-lightghost-200', styles.body)}
                dangerouslySetInnerHTML={{ __html: node.content }}
              />

              <footer
                className="flex flex-row justify-between font-light text-gray-400 dark:text-lightghost-100 border-t border-gray-200 dark:border-lightghost-100 py-8 my-12">
                <span>Copyright &copy; {new Date().getFullYear()} Unnamed Team</span>
                <span className="hover:text-lightghost-200">
                  <a href={node.htmlUrl}>Edit this page on GitHub</a>
                </span>
              </footer>
            </div>
          </div>

          <aside className="w-72">
          </aside>
        </div>
      </Background>
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
      path
    },
  };
}