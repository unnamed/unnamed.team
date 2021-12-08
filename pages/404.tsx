import Image from "next/image";
import Head from "next/head";
import Link from "next/link";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 | Not Found</title>
      </Head>
      <main className="bg-gradient-to-r from-night-100 to-night-200 h-screen flex flex-row items-center">
        <div className="w-max mx-auto flex items-center">
          <Image src="/logo.svg" width="150" height="100"/>
          <div className="flex flex-col gap-2 w-96">
            <h1 className="font-rubik text-white text-2xl">Error 404</h1>
            <p className="font-rubik font-light text-white text-lg">
              Sorry, the page you were looking for does not exist. Try
              going to
              <span className="text-pink-light hover:text-pink-dark">
                                <Link href="/"> unnamed.team</Link>
                            </span>
              , or join our
              <span className="text-pink-light hover:text-pink-dark">
                                <Link href="https://discord.gg/xbba2fy"> Discord Server</Link>
                            </span>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}