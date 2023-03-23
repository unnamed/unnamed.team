import DocumentationSideBarNode from "@/components/docs/DocumentationSideBarNode";
import {GitHubRepo} from "@/lib/docs";

export default function DocumentationSideBar({ repo, node, setNode }: { repo: GitHubRepo, node: any, setNode: any }) {
  return (
    <aside className="max-w-[256px] flex flex-col p-4 gap-4 z-50 mt-16">
      <div className="p-2.5">
        <DocumentationSideBarNode
          repo={repo}
          tree={repo.docs}
          currentRoute={[ 'docs', repo.name ]}
          selected={node}
          onSelect={selected => {
            setNode(selected);
          }}
        />
      </div>
    </aside>
  );
}