import DocumentationSideBarNode from "@/components/docs/DocumentationSideBarNode";
import clsx from "clsx";
import { useEffect } from "react";
import { useDocumentationContext } from "@/context/DocumentationContext";
import { Transition } from "@headlessui/react";

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
    <Transition
      as="aside"
      unmount={false}
      show={documentation.sideBarVisible}
      enter="transition ease-in-out duration-300 transform"
      enterFrom="-translate-x-full lg:translate-x-0"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="-translate-x-full lg:translate-x-0"
      className={clsx(
        'fixed left-0 lg:left-[calc((100vw-1024px)/2)] lg:max-w-[256px] p-4 gap-4 mt-16 max-h-[calc(100vh-64px)] z-40 bg-wine-900 overflow-y-scroll lg:!flex',
        documentation.sideBarVisible && 'inline-block w-screen h-screen'
      )}>
      <div className="p-2.5 pb-12 h-max">
        <DocumentationSideBarNode
          tree={documentation.project.docs[documentation.tag]}
          currentRoute={[ 'docs', documentation.project.name ]}
        />
      </div>
    </Transition>
  );
}