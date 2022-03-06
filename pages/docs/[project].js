import Head from 'next/head';
import { useState } from 'react';
import Background from '../../components/Background';
import * as GitHub from '../../lib/github';
import * as Documentation from '../../lib/docs';

import styles from './docs.module.scss';

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
    return (
      <ul className={`flex flex-col gap-1 ${path.length === 0 ? 'gap-4' : 'pl-4'}`}>
        {Object.entries(tree).map(([ filename, node ]) => (
          <li
            className="flex flex-col gap-1"
            key={filename}
            onClick={() => {
              if (Documentation.isContent(node)) {
                setContent(node);
                setPath([ ...path, filename ]);
              }
            }}>

            <span
              className={`cursor-pointer ${Documentation.isContent(node) ? 'font-light' : 'font-normal'} ${node === content ? 'text-primary font-normal' : ''}`}>
              {Documentation.titleOf(filename, node)}
            </span>

            {Documentation.isContent(node) || createNodeElement(node, [ ...path, filename ])}
          </li>
        ))}
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
      <Background>
        <div className="flex flex-row min-h-screen text-lightghost-200">

          <aside className={`flex-col gap-4 bg-ghost-100 py-4 px-8 w-full sm:w-max sm:flex ${sidebar ? '' : 'hidden'}`}>
            <h1>{repo.name} Documentation</h1>
            {createNodeElement(repo.docs)}
          </aside>

          <button
            className="absolute right-0 top-0 sm:hidden border"
            onClick={() => setSidebar(!sidebar)}>
            Open/Close Sidebar
          </button>

          <div className={`flex-1 max-h-screen overflow-y-scroll ${sidebar ? 'hidden sm:flex' : 'flex'}`}>
            <div className="flex-col container mx-auto p-4">
              <div className={styles.body} dangerouslySetInnerHTML={{ __html: content }}/>

              <div
                className="flex md:flex-row justify-between font-light text-lightghost-100 border-t-[1px] border-lightghost-100/10 py-8 my-12">
                <span>Copyright &copy; {new Date().getFullYear()} Unnamed Team</span>
                <span className="hover:text-lightghost-200"><a
                  href={`https://github.com/${repo.fullName}/tree/${repo.defaultBranch}/docs/${path.join('/')}`}>Edit this page on GitHub</a></span>
              </div>
            </div>
          </div>
        </div>
      </Background>
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