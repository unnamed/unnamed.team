import Head from "next/head";

export default function Editor() {
  return (
    <>
      <Head>
        <meta property="og:title" content="Unnamed | Glyphs"/>
        <meta property="og:description" content="Web-editor for Glyphs, a Minecraft plugin by Unnamed Team"/>
        <meta property="theme-color" content="#ff8df8"/>
        <title>Unnamed | Glyphs</title>
      </Head>

      <div className="editor px-8 min-h-screen">
        <h2 className="text-center">Editor</h2>
        <p className="text-center">Web-editor for µŋglyphs</p>

        <div className="file-input">
          <h2 className="text-center">Drop your emojis here</h2>
        </div>

        <div className="flex flex-row">
          <button>Save</button>
          <button>Import</button>
          <button>Export</button>
        </div>

        <div className="emojis flex container">
        </div>
      </div>
    </>
  );
}