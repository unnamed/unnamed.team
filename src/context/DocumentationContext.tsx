import {createContext, ReactNode, useContext} from 'react';
import {DocFile, DocProject} from "@/lib/docs/tree";
import {MutState} from "@/context/context";

const DocumentationContext = createContext<MutState<DocumentationData>>(
  [ null as unknown as DocumentationData, () => {} ] /* we do a little bit of type trolling */
);

export interface DocumentationData {

  // True if the sidebar is visible
  sideBarVisible: boolean;

  // The documented project
  project: DocProject;

  // The file being viewed
  file: DocFile;
}

export function DocumentationContextProvider({ state, children }: { state: MutState<DocumentationData>, children: ReactNode }) {
  return (
    <DocumentationContext.Provider value={state}>
      {children}
    </DocumentationContext.Provider>
  );
}

export function useDocumentationContext() {
  return useContext(DocumentationContext);
}