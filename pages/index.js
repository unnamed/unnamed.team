import Head from 'next/head';
import Button  from '../components/Button';
import Header from '../components/Header';
import Background  from '../components/Background';
import * as GitHub from '../lib/github';

function MainSection() {
  return (
    <main className="flex flex-col p-8 gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-wine-900 dark:text-lightghost-200 font-bold text-4xl sm:text-5xl md:text-6xl">Everything is<br/>possible</h1>
        <h3 className="text-gray-800 dark:text-lightghost-100 font-light text-lg md:text-xl">And we will show you</h3>
      </div>
      <div className="flex flex-row text-lg gap-4">
        <Button label="Show me" onClick={() => window.open(`https://github.com/${process.env.githubSlug}`)}/>
        <Button label="Join Us" onClick={() => window.open('/discord')} color="secondary"/>
      </div>
    </main>
  );
}

export default function Home({ starCount, members }) {
  return (
    <>
      <Head>
        <title>Unnamed Team</title>
        <meta property="og:title" content="Unnamed Team"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://unnamed.team/"/>
        <meta property="og:description" content="Homepage of Unnamed Team, a group of entusiast developers"/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>
      <Background>
        <Header />
        <div className="max-w-8xl mx-auto py-12">
          <MainSection />
        </div>
      </Background>
    </>
  );
};

/**
 * Fetches the team members and the GitHub star count
 */
export async function getStaticProps() {

  const data = await GitHub.cache.get();

  const starCount = data.repos.reduce((count, repo) => count + repo.stars, 0);
  const members = data.members.map(member => ({
    ...member,
    bio: member.bio ? member.bio.replace(/\r?\n/g, '') : '',
    name: member.name !== undefined ? member.name : member.login
  }));

  return {
    props: {
      starCount,
      members,
    }
  };
}