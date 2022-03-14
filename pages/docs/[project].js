import Head from 'next/head';
import { useState } from 'react';
import Background from '../../components/Background';
import * as GitHub from '../../lib/github';
import * as Documentation from '../../lib/docs';

import styles from './docs.module.scss';
import Header from '../../components/Header';

export default function Docs({ repo }) {
  const [ initialPath, initialNode ] = Documentation.findMainContentNode(repo.docs);
  const [ content, setContent ] = useState(initialNode);
  const [ path, setPath ] = useState(initialPath);
  const [ sidebar, setSidebar ] = useState(false);

  /**
   * Creates the elements for the given tree
   * node, will recurse to obtain a full element
   * tree for every sub-tree
   *
   * @param {DocTree} tree The tree
   * @param {string[]} path The filename folder path
   * @returns {JSX.Element} The elements for the tree
   */
  function createNodeElement(tree, path = []) {
    const indent = path.length > 0;

    return (
      <ul className={`flex flex-col gap-1 ${indent ? 'gap-4' : ''}`}>
        {Object.entries(tree).map(([ filename, node ]) => {
          const isContent = Documentation.isContent(node);
          const isSelected = node === content;

          return (
            <li
              className={`flex flex-col gap-1 ${indent ? 'pl-4' : ''} ${(isContent && indent) ? 'border-l border-gray-100 hover:border-gray-300' : ''} ${(isSelected && indent) ? 'border-pink-200 hover:border-pink-200' : ''}`}
              key={filename}
              onClick={() => {
                if (isContent) {
                  setContent(node);
                  setPath([ ...path, filename ]);
                }
              }}>

            <span
              className={`${isContent ? 'font-light cursor-pointer' : 'font-normal text-wine-900 dark:text-lightghost-200'} ${isSelected ? 'text-pink-200 font-normal' : (isContent ? 'text-gray-700 dark:text-lightghost-100' : '')}`}>
              {Documentation.titleOf(filename, node)}
            </span>

              {isContent || createNodeElement(node, [ ...path, filename ])}
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
      <div className="h-screen bg-white dark:bg-wine-900 overflow-y-hidden">
        <Header className="border-b border-gray-200 dark:border-lightghost-100" />

        <div className="flex flex-row justify-between max-w-8xl mx-auto h-full">
          <aside className={`w-72 flex flex-col gap-4 py-9 px-6`}>
            <h1 className="text-wine-900 dark:text-lightghost-200">{repo.name} Documentation</h1>
            {createNodeElement(repo.docs)}
          </aside>

          <div className={`flex-1 ${sidebar ? 'hidden sm:flex' : 'flex'} h-full`}>
            <div className="flex flex-col container mx-auto px-4 py-8 h-full overflow-y-scroll">
              <div
                className={`text-gray-800 font-light dark:text-lightghost-200 ${styles.body}`}
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <footer
                className="flex flex-row justify-between font-light text-gray-400 dark:text-lightghost-100 border-t border-gray-200 dark:border-lightghost-100 py-8 my-12">
                <span>Copyright &copy; {new Date().getFullYear()} Unnamed Team</span>
                <span className="hover:text-lightghost-200">
                  <a href={`https://github.com/${repo.fullName}/tree/${repo.defaultBranch}/docs/${path.join('/')}`}>Edit this page on GitHub</a>
                </span>
              </footer>
            </div>
          </div>

          <aside className="w-72">
          </aside>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const data = await GitHub.cache.get();
  const paths = [];

  for (const repo of data.repos) {

    if (repo.docs === null) {
      // no docs for this repo
      continue;
    }

    paths.push({
      params: {
        project: repo.name,
      },
    });
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {

  const data = await GitHub.cache.get();
  const { project } = params;
  const repo = data.repos.find(r => r.name === project);

  // convert from markdown to HTML
  const htmlDocs = await Documentation.toHtml(repo.docs);

  return {
    props: {
      repo: { ...repo, docs: htmlDocs },
    },
  };
}