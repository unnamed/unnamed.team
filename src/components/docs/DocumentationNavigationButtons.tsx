import { DocDir, DocFile, openDocFile, pathOf } from "@/lib/docs/tree";
import { ReactNode, useEffect, useState } from "react";
import { useDocumentationContext } from "@/context/DocumentationContext";
import { useRouter } from "next/router";

export default function DocumentationNavigationButtons() {

  const [ documentation ] = useDocumentationContext();

  const [ [ previous, next ], setPreviousAndNext ] = useState<[ DocFile | null, DocFile | null ]>([ null, null ]);

  // computes "previous" and "next" nodes
  // everytime "node" changes
  useEffect(() => {
    const dirPath = documentation.file.path.slice(0, -1);
    let currNode = documentation.project.docs[documentation.tag];

    while (dirPath.length > 0) {
      const key = dirPath.shift()!;
      let newNode = currNode[key];
      if (newNode) {
        currNode = (newNode as DocDir).content;
      } else {
        throw new Error('Invalid path: ' + documentation.file.path.join('/'));
      }
    }

    let _previous = null;
    let _next = null;
    let found = false;
    for (const val of Object.values(currNode)) {
      if (val.type !== 'file') {
        if (found) {
          let _found = Object.values(val.content).find(k => k.type === 'file');
          if (_found) {
            _next = _found as DocFile;
            break;
          }
        }
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

    setPreviousAndNext([ _previous, _next ]);
  }, [ documentation ]);

  return (
    <div className="flex flex-row justify-between mt-12 text-white/70 px-8">
      <span>
        {previous && (
          <NavigateAnchor file={previous}>
            <div className="flex flex-col items-start">
              <p className="text-pink-200 uppercase text-xs">Previous</p>
              <p>&lt; {previous.name}</p>
            </div>
          </NavigateAnchor>
        )}
      </span>
      <span>
        {next && (
          <NavigateAnchor file={next}>
            <div className="flex flex-col items-end">
              <p className="text-pink-200 uppercase text-xs">Next</p>
              <p>{next.name} &gt;</p>
            </div>
          </NavigateAnchor>
        )}
      </span>
    </div>
  );
}

function NavigateAnchor({ file, children }: { file: DocFile, children: ReactNode }) {

  const router = useRouter();
  const [ documentation ] = useDocumentationContext();

  return (
    <a
      className="cursor-pointer hover:text-white/90"
      href={pathOf(documentation.project, documentation.tag, file)}
      onClick={event => {
        event.preventDefault();
        openDocFile(router, documentation.project, documentation.tag, file).catch(console.error);
      }}>
      {children}
    </a>
  );
}