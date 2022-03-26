import Head from "next/head";
import Background from '../components/Background';
import Header from '../components/Header';

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 | Not Found</title>
      </Head>
      <Background>
        <main className="min-h-screen flex flex-col">
          <Header />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-lightghost-200 text-3xl">404</h1>
              <p className="text-lightghost-200 font-light text-lg">Sorry, the page you were looking for does not exist</p>
            </div>
          </div>
        </main>
      </Background>
    </>
  );
}