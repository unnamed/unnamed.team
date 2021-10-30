import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Button from '../components/button';

const Home: NextPage = () => {
  return (
      <>
          <Head>
              <title>Unnamed Team</title>
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
              <meta property="og:title" content="Unnamed Team" />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://unnamed.team/" />
              <meta property="og:description" content="Homepage of Unnamed Team, a group of entusiast developers" />
              <meta name="theme-color" content="#FF8DF5" />

              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" />
              <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;500;700&display=swap" rel="stylesheet" />
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

export default Home;
