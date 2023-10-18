import { useRouter } from "next/router";
import clsx from "clsx";
import { DocFile, DocTree, openDocFile } from "@/lib/docs/tree";
import { useDocumentationContext } from "@/context/DocumentationContext";
import { arrayEqual } from "@/lib/equality";

interface NodeElementProps {
  tree: DocTree;
  currentRoute: string[];
}

/**
 * Creates the elements for the given tree
 * node, will recurse to obtain a full element
 * tree for every subtree
 *
 * @returns {JSX.Element} The elements for the tree
 */
export default function DocumentationSideBarNode({ tree, currentRoute }: NodeElementProps) {

  const [ documentation, setDocumentation ] = useDocumentationContext();

  const router = useRouter();
  const indent = tree !== documentation.project.docs[documentation.tag];

  const fileChildren = Object.entries(tree).filter(([ _, node ]) => node.type === 'file') as [ string, DocFile ][];
  const dirChildren = Object.entries(tree).filter(([ _, node ]) => node.type === 'dir');

  return (
    <ul className={clsx('flex flex-col gap-2', indent && 'gap-4')}>

      {/* File entries */}
      {fileChildren.map(([ key, node ]) => {
        return (
          <li
            key={key}
            className={clsx('flex flex-col gap-1', indent && 'pl-4')}
            onClick={() => {
              setDocumentation({
                ...documentation,
                sideBarVisible: false,
                file: node
              });
              openDocFile(router, documentation.project, documentation.tag, node).catch(console.error);
            }}>
            <span
              className={clsx(
                'text-base cursor-pointer flex flex-row items-center gap-2',
                arrayEqual(node.path, documentation.file.path) ? 'font-normal text-pink-200' : 'font-light text-white/60',
              )}>
              <span className={clsx(arrayEqual(node.path, documentation.file.path) ? 'w-1.5 h-1.5 rounded-full bg-pink-200' : 'hidden')}></span>
              <span>{node.name}</span>
            </span>
          </li>
        );
      })}

      {/* Directory entries */}
      {dirChildren.map(([ key, node ]) => (
        <li
          key={key}
          className={clsx(
            'flex flex-col gap-1 mt-4',
            indent && 'pl-4',
          )}>

          <span className="text-base font-normal text-white/80">{node.name}</span>

          <DocumentationSideBarNode
            tree={node.content as DocTree}
            currentRoute={[ ...currentRoute, key ]}
          />
        </li>
      ))}
    </ul>
  );
}