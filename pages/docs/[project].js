import ErrorPage from 'next/error';
import Head from 'next/head';
import { Container } from '../../components/container';
import { fetchDocs, fetchGitHubData } from '../../lib/github';

import { remark } from 'remark';
import html from 'remark-html';
import { useRouter } from 'next/router';

export default function Docs({ data }) {
  const router = useRouter();
  if (!router.isFallback && !data) {
    return <ErrorPage statusCode={404} />;
  }

  const { repo, content } = data;

  function makeSidebar(tree) {
    return (
      <ul>
        {
          Object.entries(tree)
            .map(([name, section]) => (
              <li key={name}>
                {name}
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
      <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen flex flex-col text-white">
        <Container>
          <h1 className="text-white font-medium text-5xl opacity-90">Documentation for {repo.name}</h1>

          <div className="flex flex-row">
            <div className="flex flex-col">
              {makeSidebar(content)}
            </div>
          </div>
          {
            Object.entries(content)
              .map(([name, html]) => (
                <div key={name}>
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              ))
          }
        </Container>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const data = await fetchGitHubData(process.env.githubSlug);
  const paths = [];

  for (const repo of data.repos) {
    const content = await fetchDocs(repo);

    if (content === null) {
      // no docs for this repo
      continue;
    }

    paths.push({
      params: {
        repo,
        content
      }
    });
  }

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const { repo, content } = params;

  async function toHtml(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        obj[key] = (await remark().use(html).process(value)).toString();
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