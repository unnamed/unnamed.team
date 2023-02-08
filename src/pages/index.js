import Head from 'next/head';
import Button  from '../components/Button';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Unnamed | Home</title>
        <meta property="og:title" content="Unnamed | Home"/>
        <meta property="og:description" content="Welcome to Unnamed. Let's imagine, let's create"/>
        <meta property="og:url" content="https://unnamed.team/"/>
      </Head>
      <Header />
      <div className="max-w-5xl mx-auto py-12">
        {/* Main section */}
        <main className="flex flex-col p-8 gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-white/80 font-medium text-4xl sm:text-5xl md:text-6xl">Let&apos;s imagine<br/> let&apos;s create</h1>
            <h3 className="text-white/70 font-light text-lg md:text-xl">Let&apos;s get closer to the limits of the possible,<br/> if any...</h3>
          </div>
          <div className="flex flex-row text-lg gap-4">
            <Button label="Show me" href={`https://github.com/${process.env.githubSlug}`}/>
            <Button label="Join Us" href="/discord" color="secondary"/>
          </div>
        </main>
      </div>
    </>
  );
};