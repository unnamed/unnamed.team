/*!
 * The glyphs web-editor page, a web user interface to
 * help with the creation of µŋglyphs (formerly µŋemojis)
 * glyphs
 */
import { useState } from 'react';
import { ToastContainer } from '@/components/toast';
import Metadata from "@/components/Metadata";
import GlyphEditorHeader from "@/components/glyphs/GlyphEditorHeader";
import GlyphEditorDropRegion from "@/components/glyphs/GlyphEditorDropRegion";
import GlyphCard from "@/components/glyphs/GlyphCard";
import GlyphMap from "@/lib/glyphs/glyph.map";
import { GlyphEditorContextProvider, GlyphEditorData } from "@/context/GlyphEditorContext";

export default function EditorPage() {
  const [ data, setData ] = useState<GlyphEditorData>({
    glyphMap: new GlyphMap()
  });

  return (
    <>
      <Metadata options={{
        title: 'Glyph Editor',
        description: 'A user interface helper for µŋglyphs, a Minecraft plugin by Unnamed',
        url: 'https://unnamed.team/project/glyphs'
      }} />

      <ToastContainer>
        <GlyphEditorContextProvider state={[ data, setData ]}>
          <GlyphEditorHeader />
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 py-8">
              <GlyphEditorDropRegion />
              <div className="flex flex-wrap -mx-1">
                {data.glyphMap.values().slice().sort((a, b) => {
                  if (a.name < b.name) return -1;
                  if (a.name > b.name) return 1;
                  return 0;
                }).map(emoji => (
                  <GlyphCard
                    key={emoji.name}
                    emoji={emoji}/>
                ))}
              </div>
            </div>
          </div>
        </GlyphEditorContextProvider>
      </ToastContainer>
    </>
  );
}