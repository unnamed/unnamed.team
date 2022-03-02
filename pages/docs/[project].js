import ErrorPage from 'next/error';
import Head from 'next/head';
import { fetchCache, fetchDocs, fetchGitHubData } from '../../lib/github'
import { markdownToHtml } from '../../lib/markdown';;

import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from './project.module.scss';

function firstSection(tree) {
  const readme = tree['readme.md'];
  if (readme) {
    return [ 'readme.md', readme ];
  }

  for (const [ name, section ] of Object.entries(tree)) {
    if (typeof section === 'string') {
      return [ name, section ];
    } else {
      const found = firstSection(section);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
}

function titleOf(name, section) {
  if (typeof section !== 'string') {
    return name;
  } else if (name === 'readme.md') {
    return 'Main';
  }

  const open = '<h2>';
  const close = '</h2>';
  const start = section.indexOf(open) + open.length;
  const end = section.indexOf(close, start);

  if (start !== -1 && end !== -1) {
    return section.substring(start, end);
  }
  return name;
}


export default function Docs({ data }) {
  const router = useRouter();

  if (!router.isFallback && !data) {
    return <ErrorPage statusCode={404} />;
  }

  const { repo, content } = data;
  const [ [ sectionFileName, sectionContent ], setSection ] = useState(firstSection(content));

  function makeSidebar(tree) {
    return (
      <ul className={styles.sidebarGroup}>
        {
          Object.entries(tree)
            .map(([name, section]) => (
              <li
                className={`${styles.sidebarElement} ${typeof section === 'string' ? '' : styles.sidebarGroupTitle}`}
                key={name}
                onClick={() => {
                  if (typeof section === 'string') {
                    setSection([ name, section ]);
                  }
                }}>
                <span>{titleOf(name, section)}</span>
                { typeof section === 'string' || makeSidebar(section) }
              </li>
            ))
        }
      </ul>
    );
  }

  return (
    <>
      <Head>
        <title>{repo.name} | Docs</title>
        <meta property="og:title" content={`${repo.name} | Documentation`} />
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={`https://unnamed.team/docs/${repo.name}`}/>
        <meta property="og:description" content="" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>
      <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen text-white">
        <div className={styles.root}>
          <div className={styles.sidebar}>
            <h1>{repo.name} Documentation</h1>
            {makeSidebar(content)}
          </div>
          <div className={styles.body}>
            <div dangerouslySetInnerHTML={{ __html: sectionContent }} />
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const data = await fetchGitHubData(process.env.githubSlug);
  const allData = {};
  const paths = [];

  for (const repo of data.repos) {
    const content = await fetchDocs(repo);

    if (content === null) {
      // no docs for this repo
      continue;
    }

    allData[repo.name] = {
      repo,
      content
    };
    paths.push({
      params: {
        project: repo.name
      }
    });
  }
  await fetchCache.setAll(allData);

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { project } = params;
  const { repo, content } = await fetchCache.find(project);

  async function toHtml(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        obj[key] = await markdownToHtml(value);
      } else {
        await toHtml(value);
      }
    }
  }
  await toHtml(content);

  return {
    props: {
      data: {
        repo,
        content
      }
    }
  };
}