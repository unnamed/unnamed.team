import Head from 'next/head';
import Image from 'next/image';
import { Button } from '../components/Button';
import Card from '../components/Card';
import { fetchGitHubData } from '../lib/github';
import { Background } from '../components/Background';
import { createElement } from 'react';
import { ElementAnchor } from '../components/element_anchor';

function Section({ id, as, children }) {
  as = as || 'div';
  return createElement(
    as,
    { id, className: 'min-h-screen flex flex-col py-16 gap-12' },
    children
  );
}

function MainSection() {
  return (
    <Section id="home" as="main">
      <header className="w-full flex flex-row items-center gap-8 justify-between">
        <div className="w-max">
          <Image src="/logo.svg" alt="logo" width={64} height={64}/>
        </div>
        <div className="flex flex-row gap-32 text-white font-light text-lg">
          <span><ElementAnchor href="#home">Home</ElementAnchor></span>
          <span><ElementAnchor href="#team">Team</ElementAnchor></span>
          <span><ElementAnchor href="#about">About</ElementAnchor></span>
        </div>
        <div />
      </header>
      <div className="flex flex-col gap-4">
        <h1 className="text-white font-medium text-6xl opacity-90">Everything is<br/>possible</h1>
        <h3 className="text-white font-light text-xl opacity-90">And we will show you</h3>
      </div>
      <div className="flex flex-row text-lg gap-4">
        <Button label="Show me" onClick={() => window.open(`https://github.com/${process.env.githubSlug}`)}/>
        <Button label="Join Us" onClick={() => window.open(process.env.discordInvite)} color="secondary"/>
      </div>
    </Section>
  );
}

function MemberCard({ member }) {
  return (
    <Card onClick={() => window.open(member.html)}>
      <img src={member.avatar} alt={member.login} className="flex w-24 rounded-full"/>
      <div className="flex flex-col gap-1 items-start h-full basis-2/3">
        <div>
          <h4 className="text-white font-normal opacity-90">{member.name}</h4>
          <h5 className="text-white font-light opacity-80 text-sm">{member.login}</h5>
        </div>
        <p className="text-white font-light opacity-90">{member.bio}</p>
      </div>
    </Card>
  );
}

function TeamSection({ members }) {
  return (
    <Section id="team">
      <div className="flex flex-col gap-4">
        <h2 className="text-white font-medium text-5xl opacity-90">Meet our team</h2>
        <h3 className="text-white font-light text-lg opacity-90">The people behind the Unnamed Team who make this
          work</h3>
      </div>
      <Card.Container>
        {members.map(member => (<MemberCard key={member.login} member={member}/>))}
      </Card.Container>
    </Section>
  );
}

function AboutSection({ starCount }) {
  return (
    <Section id="about">

      <div className="flex flex-col gap-4">
        <h2 className="text-white font-medium text-5xl opacity-90">About Us</h2>
        <h3 className="text-white font-light text-lg opacity-90">This is Unnamed Team, a software development
          team.
          We make awesome open source software for everyone</h3>
      </div>

      <Card.Container>
        <Card onClick={() => window.open(`https://github.com/${process.env.githubSlug}/`)}>
          <div>
            <h4 className="text-white font-normal opacity-90">GitHub Organization</h4>
            <p className="text-white font-light opacity-90">With currently {starCount} stars in total</p>
          </div>
        </Card>

        <Card onClick={() => window.open('mailto:contact@unnamed.team')}>
          <div>
            <h4 className="text-white font-normal opacity-90">Mail Us</h4>
            <p className="text-white font-light opacity-90">Send an e-mail to contact@unnamed.team</p>
          </div>
        </Card>

        <Card onClick={() => window.open(process.env.discordInvite)}>
          <div>
            <h4 className="text-white font-normal opacity-90">Discord Server</h4>
            <p className="text-white font-light opacity-90">Join our Discord server</p>
          </div>
        </Card>
      </Card.Container>
    </Section>
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
        <div className="container mx-auto px-8">
          <MainSection />
          <TeamSection members={members} />
          <AboutSection starCount={starCount} />
        </div>
      </Background>
    </>
  );
};

/**
 * Fetches the team members and the GitHub star count
 */
export async function getStaticProps() {

  const data = await fetchGitHubData(process.env.githubSlug);

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
    },
    // Revalidates every 24 hours
    revalidate: 60 * 60 * 24,
  };
}