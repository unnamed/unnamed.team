import { createContext, ReactNode, useContext } from 'react';
import { MutState } from "@/context/context";
import GlyphMap from "@/lib/glyphs/glyph.map";

export interface GlyphEditorData {
  // The glyph map being edited
  glyphMap: GlyphMap;

  // Is the editor taking some time on loading glyphs?
  loading: boolean;
}

const GlyphEditorContext = createContext<MutState<GlyphEditorData>>(
  [ null as unknown as GlyphEditorData, () => {} ] /* we do a little bit of type trolling */
);

export function GlyphEditorContextProvider({ state, children }: { state: MutState<GlyphEditorData>, children: ReactNode }) {
  return (
    <GlyphEditorContext.Provider value={state}>
      {children}
    </GlyphEditorContext.Provider>
  );
}

export function useGlyphEditorContext() {
  return useContext(GlyphEditorContext);
}