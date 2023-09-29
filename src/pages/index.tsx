import styles from "./index.module.scss";
import Metadata from "@/components/Metadata";
import { cache, DocProjects } from "@/lib/docs";
import { DocProject } from "@/lib/docs/tree";
import Link from "next/link";
import { GitHubIcon } from "@/components/icons";
import LandingHero from "@/components/landing/LandingHero";
import clsx from "clsx";
import Footer from "@/components/layout/Footer";

function ProjectCard({ project }: { project: DocProject }) {
  return (
    <div
      className="flex flex-col py-2 md:py-4 px-4 md:px-8 gap-4 justify-between rounded-2xl border bg-white/[0.15] border-white/[.20] min-w-[400px] h-[200px]">
      <div className="flex flex-col gap-1">
        <p className="font-normal text-white/90">{project.name}</p>
        <p className="font-light text-white/70">{project.description}</p>
      </div>
      <div className="flex flex-row gap-3">
        <Link href={`https://github.com/${project.fullName}`}>
          <span className="font-normal text-sm text-white/80 hover:text-white cursor-pointer flex flex-row gap-1.5 items-center">
            <GitHubIcon />
          </span>
        </Link>
        <Link href={`/docs/${project.name}`}>
          <span className="font-normal text-sm text-white/80 hover:text-white cursor-pointer flex flex-row gap-1.5 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="20"><g fill="currentColor"><rect fill="none" height="24" width="24" /><circle cx="12" cy="3.5" fill="none" r=".75" /><circle cx="12" cy="3.5" fill="none" r=".75" /><circle cx="12" cy="3.5" fill="none" r=".75" /><path d="M19,3h-4.18C14.4,1.84,13.3,1,12,1S9.6,1.84,9.18,3H5C4.86,3,4.73,3.01,4.6,3.04C4.21,3.12,3.86,3.32,3.59,3.59 c-0.18,0.18-0.33,0.4-0.43,0.64C3.06,4.46,3,4.72,3,5v14c0,0.27,0.06,0.54,0.16,0.78c0.1,0.24,0.25,0.45,0.43,0.64 c0.27,0.27,0.62,0.47,1.01,0.55C4.73,20.99,4.86,21,5,21h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M10.3,14.88L10.3,14.88 c-0.39,0.39-1.03,0.39-1.42,0l-2.17-2.17c-0.39-0.39-0.39-1.02,0-1.41l2.17-2.17c0.39-0.39,1.03-0.39,1.42,0l0,0 c0.39,0.39,0.39,1.02,0,1.41L8.83,12l1.46,1.46C10.68,13.85,10.69,14.49,10.3,14.88z M12,4.25c-0.41,0-0.75-0.34-0.75-0.75 S11.59,2.75,12,2.75s0.75,0.34,0.75,0.75S12.41,4.25,12,4.25z M13.7,14.88L13.7,14.88c-0.39-0.39-0.39-1.02,0-1.41L15.17,12 l-1.47-1.47c-0.39-0.39-0.39-1.02,0-1.41l0,0c0.39-0.39,1.03-0.39,1.42,0l2.17,2.17c0.39,0.39,0.39,1.02,0,1.41l-2.17,2.17 C14.73,15.27,14.09,15.27,13.7,14.88z"></path></g></svg>
          </span>
        </Link>
      </div>
    </div>
  );
}

function ProjectCardRow({ projects, backbuf }: { projects: DocProjects, backbuf: boolean }) {
  return (
    <div className={clsx("relative flex flex-row gap-4 px-2", backbuf ? styles.projectCardRowBack : styles.projectCardRow)}>
      {Object.entries(projects)
        .sort(([ , a ], [ , b ]) => b.stars - a.stars)
        .map(([ key, repo ]) =>
          (<ProjectCard key={key} project={repo} />),
        )}
    </div>
  );
}

export default function HomePage({ projects }: { projects: DocProjects }) {
  return (
    <>
      <Metadata options={{
        title: 'Home',
        description: 'Welcome to Unnamed. Let\'s imagine, let\'s create',
        url: 'https://unnamed.team/'
      }} />

      <LandingHero />

      <div className="bg-pink-200/60 border-t border-b border-white/20 py-6 shadow-xl my-6" id="projects">
        <div className={clsx("w-full overflow-x-hidden relative flex flex-row gap-4 h-[200px]", styles.projectCardRowContainer)}>
          <ProjectCardRow projects={projects} backbuf={true} />
          <ProjectCardRow projects={projects} backbuf={false} />
        </div>
      </div>

      <Footer projects={projects} />
    </>
  );
};

export async function getStaticProps() {
  const projects: DocProjects = await cache.get();
  return { props: { projects } };
}