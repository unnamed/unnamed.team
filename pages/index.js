import Head from 'next/head';
import Image from 'next/image';
import Button  from '../components/Button';
import Card from '../components/Card';
import { fetchGitHubData } from '../lib/github';
import Background  from '../components/Background';
import { createElement } from 'react';
import ElementAnchor  from '../components/ElementAnchor';

function Section({ id, as, children }) {
  as = as || 'div';
  return createElement(
    as,
    { id, className: 'min-h-screen flex flex-col py-8 md:py-16 gap-10 md:gap-12' },
    children
  );
}

function MainSection() {
  return (
    <Section id="home" as="main">
      <header className="w-full flex flex-row items-center justify-between">

        <div className="w-8 h-8 sm:w-12 sm:h-12"><Image src="/logo.svg" alt="logo" width={64} height={64}/></div>

        <div className="flex-row w-full justify-around hidden md:flex md:gap-36 md:justify-center">
          {['home', 'team', 'about'].map(id => (
            <span key={id} className="capitalize font-light text-base text-lightghost-300">
              <ElementAnchor href={`#${id}`}>{id}</ElementAnchor>
            </span>
          ))}
        </div>

        <div className="hidden sm:flex" />
      </header>
      <div className="flex flex-col gap-4">
        <h1 className="text-lightghost-200 font-medium text-4xl sm:text-5xl md:text-6xl">Everything is<br/>possible</h1>
        <h3 className="text-lightghost-200 font-light text-lg md:text-xl">And we will show you</h3>
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
      <div className="w-16 md:w-20 lg:w-24">
        <Image
          className="rounded-full"
          layout="responsive"
          src={member.avatar}
          alt={member.login}
          width={1}
          height={1} />
      </div>
      <div className="flex flex-col gap-1 w-full h-full">
        <div>
          <h4 className="text-lightghost-200 font-normal text-base">{member.name}</h4>
          <h5 className="text-lightghost-200 font-light text-sm">{member.login}</h5>
        </div>
        <p className="text-lightghost-200 font-light text-base">{member.bio}</p>
      </div>
    </Card>
  );
}

function TeamSection({ members }) {
  return (
    <Section id="team">
      <div className="flex flex-col gap-4">
        <h2 className="text-lightghost-200 font-medium text-3xl sm:text-4xl md:text-5xl">Meet our team</h2>
        <h3 className="text-lightghost-200 font-light text-md md:text-lg">The people behind the Unnamed Team who make this
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
        <h2 className="text-lightghost-200 font-medium text-3xl sm:text-4xl md:text-5xl">About Us</h2>
        <h3 className="text-lightghost-200 font-light text-md md:text-lg">This is Unnamed Team, a software development
          team.
          We make awesome open source software for everyone</h3>
      </div>

      <Card.Container>
        {[
          [ `https://github.com/${process.env.githubSlug}`, 'GitHub Organization', `With currently ${starCount} stars in total` ],
          [ 'mailto:contact@unnamed.team', 'Mail Us', 'Send an e-mail to contact@unnamed.team' ],
          [ process.env.discordInvite, 'Discord Server', 'Join our Discord server' ]
        ].map(([ link, title, description ], index) => (
          <Card key={index} onClick={() => window.open(link)}>
            <div>
              <h4 className="text-lightghost-200 font-normal">{title}</h4>
              <p className="text-lightghost-200 font-light">{description}</p>
            </div>
          </Card>
        ))}
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