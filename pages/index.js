import Head from 'next/head';
import Image from 'next/image';

function MemberCard({ member }) {
  return (
    <div
      className="flex flex-row bg-black bg-opacity-30 hover:bg-opacity-40 cursor-pointer px-8 py-4 gap-4 basis-[30%] items-center">
      <img src={member.avatar} alt={member.login} className="flex w-24 rounded-full"/>
      <div className="flex flex-col gap-1 items-start h-full basis-2/3">
        <div>
          <h4 className="text-white font-normal opacity-90">{member.name}</h4>
          <h5 className="text-white font-light opacity-80 text-sm">{member.login}</h5>
        </div>
        <p className="text-white font-light opacity-90">{member.bio}</p>
      </div>
    </div>
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
      <div className="bg-gradient-to-r from-night-100 to-night-200 h-screen flex flex-col">
        <header className="w-full flex flex-row items-center px-32 py-8 gap-8 justify-between">
          <div className="w-max">
            <Image id="header__logo" src="/logo.svg" alt="logo" width={64} height={64}/>
          </div>
          <div className="flex flex-row gap-32 text-white font-light text-lg">
            <span><a href="#home">Home</a></span>
            <span><a href="#team">Team</a></span>
            <span><a href="#about">About</a></span>
          </div>
          <div>
          </div>
        </header>

        <div className="overflow-y-scroll px-48 py-8 h-full">

          <main className="h-screen flex flex-col gap-4" id="home">
            <div className="flex flex-col gap-4">
              <h1 className="text-white font-medium text-6xl opacity-90">Everything is<br/>possible</h1>
              <h3 className="text-white font-light text-xl opacity-90">And we will show you</h3>
            </div>
            <div className="flex flex-row text-lg gap-4">
              <button
                className="bg-pink-light font-light py-2 px-3 rounded-md hover:bg-pink-dark"
                onClick={() => window.open('https://github.com/unnamed')}>Show me
              </button>
              <button
                className="bg-black bg-opacity-30 font-light text-white opacity-90 py-2 px-3 rounded-md hover:bg-opacity-40"
                onClick={() => window.open('https://discord.gg/xbba2fy')}>Join Us
              </button>
            </div>
          </main>

          <div className="h-screen flex flex-col gap-8" id="team">
            <div className="flex flex-col gap-4">
              <h2 className="text-white font-medium text-5xl opacity-90">Meet our team</h2>
              <h3 className="text-white font-light text-lg opacity-90">The people behind the Unnamed Team who make this
                work</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map(member => (<MemberCard key={member.login} member={member}/>))}
            </div>
          </div>

          <div className="h-screen flex flex-col gap-8" id="about">

            <div className="flex flex-col gap-4">
              <h2 className="text-white font-medium text-5xl opacity-90">About Us</h2>
              <h3 className="text-white font-light text-lg opacity-90">This is Unnamed Team, a software development
                team.
                We make awesome open source software for everyone</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Ah yes, don't repeat your self (TODO) */}
              <div
                className="flex flex-col bg-black bg-opacity-30 hover:bg-opacity-40 cursor-pointer px-8 py-4 gap-2 basis-[30%]"
                onClick={() => window.open('https://github.com/unnamed/')}>
                <h4 className="text-white font-normal opacity-90">GitHub Organization</h4>
                <p className="text-white font-light opacity-90">With currently {starCount} stars in total</p>
              </div>

              <div
                className="flex flex-col bg-black bg-opacity-30 hover:bg-opacity-40 cursor-pointer px-8 py-4 gap-2 basis-[30%]"
                onClick={() => window.open('mailto:contact@unnamed.team')}>
                <h4 className="text-white font-normal opacity-90">Mail Us</h4>
                <p className="text-white font-light opacity-90">Send an e-mail to contact@unnamed.team</p>
              </div>

              <div
                className="flex flex-col bg-black bg-opacity-30 hover:bg-opacity-40 cursor-pointer px-8 py-4 gap-2 basis-[30%]"
                onClick={() => window.open('https://discord.gg/xbba2fy')}>
                <h4 className="text-white font-normal opacity-90">Discord Server</h4>
                <p className="text-white font-light opacity-90">Join our Discord server</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Fetches the team members and the GitHub star count
 */
export async function getStaticProps() {

  // name of the organization on GitHub
  const organization = "unnamed";

  // fetches and counts total star count on our repositories
  const starCount = await fetch(`https://api.github.com/orgs/${organization}/repos`)
    .then(response => response.json())
    .then(repositories => repositories.filter(repo => !repo.fork).reduce((count, repo) => count + repo.stargazers_count, 0));

  // fetch team members
  const members = await fetch(`https://api.github.com/orgs/${organization}/public_members`)
    .then(response => response.json())
    .then(members => Promise.all(members.map(({ url }) => {
      return fetch(url)
        .then(response => response.json())
        .then(member => {
          let { name, login, bio, avatar_url, html_url } = member;
          bio = bio ? bio.replace(/\r?\n/g, '') : "";
          name = name ? name : login;

          return {
            name,
            login,
            bio,
            avatar: avatar_url,
            html: html_url,
          };
        });
    })));

  return {
    props: {
      starCount,
      members,
    },
    // Revalidates every 24 hours
    revalidate: 60 * 60 * 24,
  };
}