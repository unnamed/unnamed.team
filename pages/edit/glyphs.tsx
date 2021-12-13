import Head from "next/head";
import Button from "../../components/button";
import { CSSProperties, useState } from "react";

interface Glyph {
  image: string;
}

function GlyphComponent({glyph}: { glyph: Glyph }) {
  const imageStyle: CSSProperties = {
    imageRendering: "pixelated"
  };
  return (
    <div className="flex flex-row bg-pink-light rounded-2xl p-8 w-48">
      <img src={glyph.image} alt="Glyph" className="w-full" style={imageStyle} />
    </div>
  );
}

export default function Editor() {
  const [ glyphs, setGlyphs ] = useState(new Map<string, Glyph>());

  function addTestingGlyphs(count: number) {
    while (count-- > 0) {
      glyphs.set(count.toString(), {
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAABSklEQVQokZWSwUoCQRjHfzNuhIbaIQ8ZXtSTXroEgQ8QXjx79BJ17RLiA4T0BHnz2BtIz9BdCLTLErEg1K44S7jOdFi1XRGxP8xl5vsN3/zmE7WqxTKG/SIAVpTptxN7Ua3uwgBC1KqW6bcTlAsB7mlvJ5T9vGFkW7S6C+TmwS4omvUD1cwidRRQOL/GG8TuI1PXeAOJmq3Lkc6XDsFAk2sY3p8tcg3DxJVMXBnbU0FY63xpRDkvzeDiFoBkpcTZ1f3WVj9eHvGHYwDqr09/rSYrJfzhmMml3Ar6w/G6BgjlRDeKzYCTrI6tYjOIwWs5fqUDFSgXArw7SaauOTwQAPzMzVJWj5Ft4UetOu6CdCqU8e1JvEEQaVIwsi2OMxo1N0yVjn/HVGneFKRTodFo1Nzg2IboVIpyXgKYfme7lM20HjSAWIHwzyH/BXs5iw9EFkbFAAAAAElFTkSuQmCC"
      });
    }
  }

  addTestingGlyphs(10);

  return (
    <>
      <Head>
        <meta property="og:title" content="Unnamed | Glyphs"/>
        <meta property="og:description" content="Web-editor for Glyphs, a Minecraft plugin by Unnamed Team"/>
        <meta property="theme-color" content="#ff8df8"/>
        <title>Unnamed | Glyphs</title>
      </Head>

      <div className="flex flex-col bg-gradient-to-b from-night-100 to-night-200 min-h-screen editor px-40 py-10 gap-8">
        <div className="font-light">
          <h2 className="text-center text-4xl text-white">Editor</h2>
          <p className="text-center text-lg text-white">Web-editor for µŋglyphs</p>
        </div>

        <div className="w-min self-center flex flex-col gap-2">
          <div className="flex items-center bg-pink-light w-80 h-40 rounded-2xl">
            <h2 className="text-white text-center text-xl w-full">Drop your emojis here</h2>
          </div>

          <div className="flex flex-row gap-2 w-min self-center">
            <Button size="md">Save</Button>
            <Button size="md">Import</Button>
            <Button size="md">Export</Button>
          </div>
        </div>

        <div className="emojis flex container flex-wrap gap-4 w-max max-w-full self-center">
          {Array.from(glyphs).map(([ id, glyph ]) =>
            (<GlyphComponent key={id} glyph={glyph}/>))}
        </div>
      </div>
    </>
  );
}