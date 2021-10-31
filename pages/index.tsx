import Head from 'next/head';
import Image from 'next/image';
import Button from '../components/button';

export default function Home() {
  return (
      <>
          <Head>
              <title>Unnamed Team</title>
              <meta property="og:title" content="Unnamed Team" />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://unnamed.team/" />
              <meta property="og:description" content="Homepage of Unnamed Team, a group of entusiast developers" />
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
              <meta name="theme-color" content="#ff8df8" />
          </Head>

          <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen">

              {/* First section */}
              <div className="min-h-screen flex flex-col px-40 py-10">
                  {/* Header */}
                  <header className="flex flex-row justify-between">
                      <Image src="/logo.svg" width="65" height="65" />

                      <div className="flex gap-10 text-white">
                          <a>Home</a>
                          <a>Team</a>
                          <a>About</a>
                      </div>
                  </header>

                  {/* Main section */}
                  <main className="flex flex-col px-4 py-20 gap-4">
                      <h1 className="text-5xl text-white">Everything is possible</h1>
                      <p className="text-xl text-white">And we will show you</p>

                      <div className="flex gap-2">
                          <Button value="Show me" />
                          <Button value="Reviews" />
                      </div>
                  </main>
              </div>
          </div>


      </>
  );
};
