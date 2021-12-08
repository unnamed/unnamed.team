import Head from 'next/head';
import Image from 'next/image';
import Button from '../components/button';
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";

export default function Home() {
  return (
    <>
      <Head>
        <title>Unnamed Team</title>
        <meta property="og:title" content="Unnamed Team"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://unnamed.team/"/>
        <meta property="og:description" content="Homepage of Unnamed Team, a group of entusiast developers"/>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
        <meta name="theme-color" content="#ff8df8"/>
      </Head>

      <div className="bg-gradient-to-r from-night-100 to-night-200 min-h-screen">

        {/* First section */}
        <div className="min-h-screen flex flex-col px-40 py-10">
          {/* Header */}
          <header className="flex flex-row justify-between">
            <Image src="/logo.svg" width="65" height="65"/>

            <div className="flex gap-10 text-white">
              <a>Home</a>
              <a>Projects</a>
              <a>About</a>
            </div>
          </header>

          {/* Main section */}
          <main className="flex flex-col px-8 py-20 gap-8">
            <div className="flex flex-col gap-2 font-light">
              <h1 className="text-6xl text-white">Everything is possible</h1>
              <p className="text-xl text-white text-opacity-70">And we will show you</p>
            </div>

            <div>
              <Button><span>Explore</span> <FaChevronRight/></Button>
            </div>
          </main>

          {/* Statistics Section */}
          <div className="mx-8 bg-pink-light py-8 px-12 rounded-3xl flex flex-row gap-16 text-white">
            <div className="flex flex-row flex-1 justify-between items-center">
              {/* Stars on GitHub */}
              <div className="flex flex-col items-center">
                <p className="font-light text-lg">Stars</p>
                <p className="font-normal text-5xl">170+</p>
              </div>

              {/* Projects */}
              <div className="flex flex-col items-center">
                <p className="font-light text-lg">Projects</p>
                <p className="font-normal text-5xl">10+</p>
              </div>

              {/* Happiness */}
              <div className="flex flex-col items-center">
                <p className="font-light text-lg">Happiness</p>
                <p className="font-normal text-5xl">100%</p>
              </div>
            </div>

            <div className="border-0 border-r border-white h-24">
            </div>

            <div className="flex-1 items-center">
              <p className="font-normal">Our customers say:</p>
              <p className="font-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Quisque ut dui vestibulum dolor tincidunt pulvinar sit amet sed massa.
                Ut dapibus viverra sem, eu tristique purus suscipit in.</p>
            </div>
          </div>
        </div>


      </div>


    </>
  );
};
