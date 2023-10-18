import { useEffect, useState } from 'react';

import styles from './docs.module.scss';
import Header from '../../components/layout/Header';
import clsx from 'clsx';
import { GetStaticProps } from "next";
import { DocDir, DocFile, DocNode, DocProject, findInTree, pathOf } from "@/lib/docs/tree";
import DocumentationSideBar from "@/components/docs/DocumentationSideBar";
import Metadata from "@/components/Metadata";
import { cache, DocProjects } from "@/lib/docs";
import { Bars3Icon, CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import DocumentationFooter from "@/components/docs/DocumentationFooter";
import { DocumentationContextProvider, DocumentationData } from "@/context/DocumentationContext";
import { useRouter } from "next/router";
import { trimArray } from "@/lib/string";
import DocumentationNavigationButtons from "@/components/docs/DocumentationNavigationButtons";

interface PageProps {
  project: DocProject;
  tag: string | 'latest';
  path: string[];
}

export default function Docs({ project, ...props }: PageProps) {

  const router = useRouter();

  const [ selectingTag, setSelectingTag ] = useState(false);
  const [ documentation, setDocumentation ] = useState<DocumentationData>({
    sideBarVisible: false,
    project,
    tag: props.tag,
    file: findInTree(project.docs[props.tag], props.path)!
  });

  useEffect(() => {
    const path = router.asPath.split('/');
    trimArray(path);

    path.shift(); // remove 'docs' thing
    path.shift(); // remove the project name

    let tag =  path.shift(); // remove the tag
    if (!tag || project.docs[tag] === undefined) {
      if (tag) {
        path.unshift(tag);
      }
      // not a valid tag
      tag = 'latest';
    }

    let file = findInTree(project.docs[tag], path);

    if (file && file.path === documentation.file.path) {
      // already the same, no need to change
      return;
    }

    setDocumentation({
      ...documentation,
      file: file!
    });
  }, [ router ]);

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
          <div className="flex flex-1 items-center justify-start px-6">
            <div className="flex flex-col relative text-sm text-white/[.45] rounded-lg overflow-hidden shadow-sm border-t border-b border-t-white/10 border-b-black/10 bg-white/[.15]" onClick={() => setSelectingTag(!selectingTag)}>
              <div className="flex flex-row gap-1 px-2 py-0.5 hover:bg-white/20 cursor-pointer">
                <span>{documentation.tag}</span>
                <ChevronDownIcon className="w-3" />
              </div>

              {selectingTag && (
                <div className="fixed rounded-lg overflow-hidden flex flex-col bottom-[-165%] z-50 border-t border-b border-t-white/10 border-b-black/10 bg-[#3C3249] w-36 text-base py-1 shadow-lg">
                  {Object.keys(project.docs)
                    .map(tag => (
                      <div
                        key={tag}
                        className={`flex flex-row justify-between items-center w-full px-4 py-1.5 ${tag === documentation.tag ? 'text-pink-200' : 'text-white/60 cursor-pointer hover:bg-white/[.15]'}`}
                        onClick={() => {
                          setDocumentation({
                            ...documentation,
                            file: findInTree(project.docs[tag], [])!,
                            tag
                          });
                          setSelectingTag(false);
                          router.push(
                            `/docs/${project.name}/${tag}`,
                            undefined,
                            { shallow: true, scroll: true }
                          );
                        }}>
                        <span>{tag}</span>
                        <span>{tag === documentation.tag && (<CheckIcon className="w-5" />)}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
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

                <DocumentationNavigationButtons />
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
    addPath([ ...path, key ]);
    if (tree.type === 'dir') {
      for (const [ childKey, childNode ] of Object.entries((tree as DocDir).content)) {
        await it(childKey, childNode, [ ...path, key ]);
      }
    }
  }

  for (const repo of Object.values(repos)) {

    // root path
    addPath([ repo.name ]);

    // section paths
    for (const [ key, tree ] of Object.entries(repo.docs['latest'])) {
      await it(key, tree, [ repo.name ]);
    }
    for (const tag of Object.keys(repo.docs)) {
      addPath([ repo.name, tag ]);
      for (const [ key, tree ] of Object.entries(repo.docs[tag])) {
        await it(key, tree, [ repo.name, tag ]);
      }
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

  // check tag
  let tag;
  if (path.length === 0) {
    tag = 'latest';
  } else {
    tag = path[0];
    if (!project.docs[tag]) {
      // not a valid tag
      tag = 'latest';
    } else {
      path.shift();
    }
  }

  return {
    props: {
      project,
      tag,
      path,
    },
  };
};