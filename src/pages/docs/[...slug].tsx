import { useEffect, useState } from 'react';

import styles from './docs.module.scss';
import Header from '../../components/layout/Header';
import clsx from 'clsx';
import { GetStaticProps } from "next";
import {DocDir, DocFile, DocNode, DocProject, findInTree} from "@/lib/docs/tree";
import DocumentationSideBar from "@/components/docs/DocumentationSideBar";
import Metadata from "@/components/Metadata";
import {cache, DocProjects} from "@/lib/docs";
import {Bars3Icon} from "@heroicons/react/24/solid";
import DocumentationFooter from "@/components/docs/DocumentationFooter";
import {DocumentationContextProvider, DocumentationData} from "@/context/DocumentationContext";

interface PageProps {
  project: DocProject;
  path: string[];
}

export default function Docs({ project, ...props }: PageProps) {
  const [ currentTree, initialNode ] = findInTree(project.docs, [ ...props.path ]);

  const [ documentation, setDocumentation ] = useState<DocumentationData>({
    sideBarVisible: false,
    project,
    file: initialNode
  });

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
      if (val.name === documentation.file.name) {
        found = true;
        continue;
      }
      _previous = val;
    }

    setPrevious(_previous);
    setNext(_next);
  }, [ documentation ]);

  return (
    <DocumentationContextProvider state={[ documentation, setDocumentation ]}>
      <Metadata options={{
        title: `${project.name} Documentation`,
        url: `https://unnamed.team/docs/${project.name}`,
        description: project.description
      }} />
      <div className="flex flex-col h-full w-full">

        {/* Fixed header */}
        <Header className="fixed bg-wine-900/80 backdrop-blur-sm z-50">
          <div className="flex md:hidden">
            <button onClick={() => setDocumentation(doc => ({ ...doc, sideBarVisible: !doc.sideBarVisible }))}>
              <Bars3Icon className="w-6 h-6 text-white/80" />
            </button>
          </div>
        </Header>

        {/* Fixed left sidebar */}
        <DocumentationSideBar />

        <div className="w-screen h-full">
          <div className="w-screen lg:max-w-5xl lg:mx-auto flex flex-row justify-end mt-16">
            {/* Content */}
            <main className="w-screen lg:max-w-[768px]">
              <div className="flex flex-col mx-auto">

                {/* The actual content */}
                <div
                  className={clsx('text-white/60 font-light w-screen px-8 lg:w-full z-10', styles.body)}
                  dangerouslySetInnerHTML={{ __html: documentation.file.content }}
                />

                {/* Pagination buttons */}
                <div className="flex flex-row justify-between mt-12 text-white/70 px-8">
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

                <DocumentationFooter />

              </div>
            </main>
          </div>
        </div>
      </div>
    </DocumentationContextProvider>
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