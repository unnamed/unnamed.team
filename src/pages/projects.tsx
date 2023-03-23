import Header from '../components/Header';
import * as GitHub from '../lib/docs';
import Link from 'next/link';
import Metadata from "@/components/Metadata";

function ProjectCard({ project }: { project: GitHub.GitHubRepo }) {
  return (
    <div className="flex basis-full p-2 md:p-3 md:basis-1/2 xl:basis-1/3">
      <div
        className="flex flex-col py-2 md:py-4 px-4 md:px-8 gap-4 w-full justify-between rounded-2xl border bg-white/10 border-white/[.15]">
        <div className="flex flex-col gap-1">
          <p className="font-normal text-white/80">{project.name}</p>
          <p className="font-light text-white/60">{project.description}</p>
        </div>
        <div className="flex flex-row gap-3">
          <Link href={`https://github.com/${project.fullName}`}>
            <span className="font-normal text-sm text-white/70 hover:text-pink-200 cursor-pointer flex flex-row gap-1.5 items-center">
              <svg width="20" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" transform="scale(64)" fill="currentColor"/></svg>
            </span>
          </Link>
          <Link href={`/docs/${project.name}`}>
            <span className="font-normal text-sm text-white/70 hover:text-pink-200 cursor-pointer flex flex-row gap-1.5 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="20"><g fill="currentColor"><rect fill="none" height="24" width="24" /><circle cx="12" cy="3.5" fill="none" r=".75" /><circle cx="12" cy="3.5" fill="none" r=".75" /><circle cx="12" cy="3.5" fill="none" r=".75" /><path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5C4.86,3,4.73,3.01,4.6,3.04C4.21,3.12,3.86,3.32,3.59,3.59 c-0.18,0.18-0.33,0.4-0.43,0.64C3.06,4.46,3,4.72,3,5v14c0,0.27,0.06,0.54,0.16,0.78c0.1,0.24,0.25,0.45,0.43,0.64 c0.27,0.27,0.62,0.47,1.01,0.55C4.73,20.99,4.86,21,5,21h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M10.3,14.88L10.3,14.88 c-0.39,0.39-1.03,0.39-1.42,0l-2.17-2.17c-0.39-0.39-0.39-1.02,0-1.41l2.17-2.17c0.39-0.39,1.03-0.39,1.42,0l0,0 c0.39,0.39,0.39,1.02,0,1.41L8.83,12l1.46,1.46C10.68,13.85,10.69,14.49,10.3,14.88z M12,4.25c-0.41,0-0.75-0.34-0.75-0.75 S11.59,2.75,12,2.75s0.75,0.34,0.75,0.75S12.41,4.25,12,4.25z M13.7,14.88L13.7,14.88c-0.39-0.39-0.39-1.02,0-1.41L15.17,12 l-1.47-1.47c-0.39-0.39-0.39-1.02,0-1.41l0,0c0.39-0.39,1.03-0.39,1.42,0l2.17,2.17c0.39,0.39,0.39,1.02,0,1.41l-2.17,2.17 C14.73,15.27,14.09,15.27,13.7,14.88z"></path></g></svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Projects({ repos }: { repos: GitHub.GitHubRepos }) {
  return (
    <>
      <Metadata options={{
        title: 'Unnamed | Projects',
        description: 'Our projects: open source libraries and Minecraft plugins',
        url: 'https://unnamed.team/projects'
      }} />

      <Header/>
      <div className="max-w-5xl mx-auto">
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
  const repos: GitHub.GitHubRepos = await GitHub.cache.get();
  return { props: { repos } };
}