import Head from "next/head";
import Button from "../../components/button";

export default function Editor() {
  return (
    <>
      <Head>
        <meta property="og:title" content="Unnamed | Glyphs"/>
        <meta property="og:description" content="Web-editor for Glyphs, a Minecraft plugin by Unnamed Team"/>
        <meta property="theme-color" content="#ff8df8"/>
        <title>Unnamed | Glyphs</title>
      </Head>

      <div className="flex flex-col bg-gradient-to-r from-night-100 to-night-200 min-h-screen editor px-40 py-10 gap-8">
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

        <div className="emojis flex container">
        </div>
      </div>
    </>
  );
}