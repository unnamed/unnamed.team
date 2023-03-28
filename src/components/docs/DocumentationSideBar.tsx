import DocumentationSideBarNode from "@/components/docs/DocumentationSideBarNode";
import {DocProject} from "@/lib/docs/tree";

export default function DocumentationSideBar({ project, node, setNode }: { project: DocProject, node: any, setNode: any }) {
  return (
    <aside className="max-w-[256px] flex flex-col p-4 gap-4 z-50 mt-16">
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