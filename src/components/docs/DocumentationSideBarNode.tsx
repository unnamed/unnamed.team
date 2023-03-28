import { useRouter } from "next/router";
import clsx from "clsx";
import {DocFile, DocProject, DocTree} from "@/lib/docs/tree";

interface NodeElementProps {
  repo: DocProject;
  tree: DocTree;
  currentRoute: string[];
  selected: DocFile;
  onSelect: (node: DocFile) => void
}

/**
 * Creates the elements for the given tree
 * node, will recurse to obtain a full element
 * tree for every sub-tree
 *
 * @returns {JSX.Element} The elements for the tree
 */
export default function DocumentationSideBarNode({ repo, tree, currentRoute, selected, onSelect }: NodeElementProps) {
  const router = useRouter();
  const indent = tree !== repo.docs;

  const fileChildren = Object.entries(tree).filter(([ _, node ]) => node.type === 'file');
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
              onSelect(node as DocFile);
              router.push(
                '/' + currentRoute.join('/') + '/' + key,
                undefined,
                { shallow: true },
              ).catch(console.error);
            }}>
            <span
              className={clsx(
                'text-base cursor-pointer',
                node === selected ? 'font-normal text-pink-200' : 'font-light text-white/60',
              )}>
              {node.name}
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
            repo={repo}
            tree={node.content as DocTree}
            selected={selected}
            currentRoute={[ ...currentRoute, key ]}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}