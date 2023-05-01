import DocumentationSideBarNode from "@/components/docs/DocumentationSideBarNode";
import clsx from "clsx";
import {useEffect} from "react";
import {useDocumentationContext} from "@/context/DocumentationContext";

export default function DocumentationSideBar() {

  const [ documentation ] = useDocumentationContext();

  useEffect(() => {
    const style = document.body.style;
    if (documentation.sideBarVisible) {
      style.height = '100vh';
      style.overflowY = 'hidden';
    } else {
      style.height = '';
      style.overflowY = '';
    }
  }, [ documentation ]);

  return (
    <aside className={clsx(
      'fixed left-0 lg:left-[calc((100vw-1024px)/2)] lg:max-w-[256px] p-4 gap-4 mt-16 max-h-[calc(100vh-64px)] z-50 bg-wine-900 overflow-y-scroll',
      documentation.sideBarVisible ? 'inline-block w-screen h-screen' : 'hidden lg:inline-block'
    )}>
      <div className="p-2.5">
        <DocumentationSideBarNode
          tree={documentation.project.docs}
          currentRoute={[ 'docs', documentation.project.name ]}
        />
      </div>
    </aside>
  );
}