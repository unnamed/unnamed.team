import Button from '../components/Button';
import Header from '../components/Header';
import Metadata from "@/components/Metadata";

export default function HomePage() {
  return (
    <>
      <Metadata options={{
        title: 'Unnamed | Home',
        description: 'Welcome to Unnamed. Let\'s imagine, let\'s create',
        url: 'https://unnamed.team/'
      }} />

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