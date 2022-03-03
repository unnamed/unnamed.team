import Head from 'next/head';
import * as GitHub from '../../lib/github';
import * as Documentation from '../../lib/docs';

import { useState } from 'react';
import styles from './project.module.scss';
import { Background } from '../../components/background';

export default function Docs({ data }) {
  const repo = data.repo;
  const rootTree = data.content;
  const [ content, setContent ] = useState(Documentation.findMainContentNode(rootTree));

  /**
   * Creates the elements for the given tree
   * node, will recurse to obtain a full element
   * tree for every sub-tree
   *
   * @param {DocTree} tree The tree
   * @returns {JSX.Element} The elements for the tree
   */
  function createNodeElement(tree) {
    return (
      <ul className={styles.sidebarGroup}>
        {Object.entries(tree).map(([ filename, node ]) => (
          <li
            className={`${styles.sidebarElement} ${Documentation.isContent(node) ? '' : styles.sidebarGroupTitle}`}
            key={filename}
            onClick={() => {
              if (Documentation.isContent(node)) {
                setContent(node);
              }
            }}>

            <span>{Documentation.titleOf(filename, node)}</span>

            {Documentation.isContent(node) || createNodeElement(node)}
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
        <div className={styles.root}>
          <div className={styles.sidebar}>
            <h1>{repo.name} Documentation</h1>
            {createNodeElement(rootTree)}
          </div>
          <div className={styles.body}>
            <div dangerouslySetInnerHTML={{ __html: content }}/>
          </div>
        </div>
      </Background>
    </>
  );
}

export async function getStaticPaths() {
  const data = await GitHub.fetchGitHubData(process.env.githubSlug);
  const allData = {};
  const paths = [];

  for (const repo of data.repos) {
    const content = await GitHub.fetchDocs(repo);

    if (content === null) {
      // no docs for this repo
      continue;
    }

    allData[repo.name] = { repo, content };
    paths.push({
      params: {
        project: repo.name,
      },
    });
  }
  await GitHub.fetchCache.setAll(allData);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { project } = params;
  const { repo, content } = await GitHub.fetchCache.find(project);

  // convert from markdown to HTML
  await Documentation.toHtml(content);

  return {
    props: {
      data: {
        repo,
        content,
      },
    },
  };
}