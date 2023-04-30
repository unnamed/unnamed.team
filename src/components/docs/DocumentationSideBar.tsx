import DocumentationSideBarNode from "@/components/docs/DocumentationSideBarNode";
import {DocProject} from "@/lib/docs/tree";
import clsx from "clsx";
import {useEffect} from "react";

export default function DocumentationSideBar({ project, node, setNode, shown }: { project: DocProject, node: any, setNode: any, shown: boolean }) {
  useEffect(() => {
    const style = document.body.style;
    if (shown) {
      style.height = '100vh';
      style.overflowY = 'hidden';
    } else {
      style.height = '';
      style.overflowY = '';
    }
  }, [ shown ]);

  return (
    <aside className={clsx(
      'fixed left-0 lg:left-[calc((100vw-1024px)/2)] lg:max-w-[256px] p-4 gap-4 mt-16 max-h-[calc(100vh-64px)] z-50 bg-wine-900 overflow-y-scroll',
      shown ? 'inline-block w-screen h-screen' : 'hidden lg:inline-block'
    )}>
      <div className="p-2.5">
        <DocumentationSideBarNode
          repo={project}
          tree={project.docs}
          currentRoute={[ 'docs', project.name ]}
          selected={node}
          onSelect={selected => {
            setNode(selected);
          }}
        />
      </div>
    </aside>
  );
}