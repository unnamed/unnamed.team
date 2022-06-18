import Head from 'next/head';
import Header from '../components/Header';
import * as GitHub from '../lib/docs';
import Link from 'next/link';

function ProjectCard({ project }) {
  return (
    <div className="flex basis-full p-2 md:p-3 md:basis-1/2 xl:basis-1/3">
      <div
        className="flex flex-col py-2 md:py-4 px-4 md:px-8 gap-4 w-full justify-between rounded-2xl border bg-white/10 border-white/[.15]">
        <div className="flex flex-col gap-1">
          <p className="font-normal text-white/80">{project.name}</p>
          <p className="font-light text-white/60">{project.description}</p>
        </div>
        <div className="flex flex-row gap-2">
          {
            [
              [ `https://github.com/${project.fullName}`, 'GitHub' ],
              [ `/docs/${project.name}`, 'Docs' ],
            ].map(([ href, label ]) => (
              <span key={href} className="font-normal text-sm text-white/70 hover:text-pink-200">
                <Link href={href}>{label}</Link>
              </span>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default function Projects({ repos }) {
  return (
    <>
      <Head>
        <title>Unnamed | Projects</title>
        <meta property="og:description" content="Our projects: open source libraries and Minecraft plugins"/>
        <meta property="og:url" content="https://unnamed.team/projects"/>
      </Head>
      <Header/>
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="p-8 text-white/80 font-medium text-3xl sm:text-4xl md:text-5xl">Our Projects</h1>
        <div className="flex flex-col gap-8 px-8">
          <div className="flex flex-wrap -mx-1">
            {Object.entries(repos)
              .map(([ key, repo ]) =>
                (<ProjectCard key={key} project={repo}/>),
              )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const repos = await GitHub.cache.get();
  return { props: { repos } };
}