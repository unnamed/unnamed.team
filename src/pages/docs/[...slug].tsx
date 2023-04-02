import { useEffect, useState } from 'react';

import styles from './docs.module.scss';
import Header from '../../components/Header';
import clsx from 'clsx';
import { GetStaticProps } from "next";
import {DocDir, DocFile, DocNode, DocProject, findInTree} from "@/lib/docs/tree";
import DocumentationSideBar from "@/components/docs/DocumentationSideBar";
import Metadata from "@/components/Metadata";
import YearRange from "@/components/text/YearRange";
import {cache, DocProjects} from "@/lib/docs";

interface PageProps {
  project: DocProject;
  path: string[];
}

export default function Docs(props: PageProps) {
  const { project } = props;
  const [ currentTree, initialNode ] = findInTree(project.docs, [ ...props.path ]);

  const [ node, setNode ] = useState<DocFile>(initialNode);

  const [ previous, setPrevious ] = useState<DocFile | null>(null);
  const [ next, setNext ] = useState<DocFile | null>(null);

  // computes "previous" and "next" nodes
  // everytime "node" changes
  useEffect(() => {
    let _previous = null;
    let _next = null;
    let found = false;
    for (const val of Object.values(currentTree)) {
      if (val.type !== 'file') {
        // TODO:
        continue;
      }
      if (found) {
        _next = val;
        break;
      }
      if (val.name === node.name) {
        found = true;
        continue;
      }
      _previous = val;
    }

    setPrevious(_previous);
    setNext(_next);
  }, [ node ]);

  return (
    <>
      <Metadata options={{
        title: `${project.name} Documentation`,
        url: `https://unnamed.team/docs/${project.name}`,
        description: project.description
      }} />
      <div className="flex flex-col h-full w-full">

        {/* Fixed header */}
        <Header
          className="fixed bg-wine-900/80 backdrop-blur-sm z-50"
        />
        {/* Fixed container, contains header and sidebars */}
        <div className="fixed w-screen h-screen">
          <div className="max-w-5xl mx-auto">
            {/* Navigation */}
            <DocumentationSideBar project={project} node={node} setNode={setNode} />
          </div>
        </div>


        <div className="w-screen h-full">
          <div className="max-w-5xl mx-auto flex flex-row justify-end mt-16">
            {/* Content */}
            <main className="max-w-[768px] flex z-10">
              <div className="flex flex-col mx-auto">

                {/* The actual content */}
                <div
                  className={clsx('text-white/60 font-light w-full', styles.body)}
                  dangerouslySetInnerHTML={{ __html: node.content }}
                />

                {/* Pagination buttons */}
                <div className="flex flex-row justify-between mt-12 text-white/70">
                  <span>
                    {previous && (
                      <span className="cursor-pointer hover:text-white/90">
                        &lt; {previous.name}
                      </span>
                    )}
                  </span>
                  <span>
                    {next && (
                      <span className="cursor-pointer hover:text-white/90">
                        {next.name} &gt;
                      </span>
                    )}
                  </span>
                </div>

                {/* The page footer */}
                <footer className="flex flex-row justify-between font-light text-white/40 py-8 my-12">
                  <span>Copyright &copy; <YearRange from={2021} /> Unnamed Team</span>
                  <span className="hover:text-white/60">
                    <a href={node.htmlUrl}>Edit this page on GitHub</a>
                  </span>
                </footer>
                
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const repos: DocProjects = await cache.get();
  const paths: any[] = [];

  function addPath(path: string[]) {
    paths.push({
      params: {
        slug: path,
      },
    });
  }

  async function it(key: string, tree: DocNode, path: string[]) {
    if (tree.type === 'file') {
      addPath([ ...path, key ]);
    } else {
      for (const [ childKey, childNode ] of Object.entries((tree as DocDir).content)) {
        await it(childKey, childNode, [ ...path, key ]);
      }
    }
  }

  for (const repo of Object.values(repos)) {

    // root path
    addPath([ repo.name ]);

    // section paths
    for (const [ key, tree ] of Object.entries(repo.docs)) {
      await it(key, tree, [ repo.name ]);
    }
  }

  return {
    paths,
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const projects = await cache.get();
  const [ projectName, ...path ] = params!['slug'] as string[];
  const project = projects[projectName];
  return {
    props: {
      project,
      path,
    },
  };
};