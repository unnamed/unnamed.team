import Metadata from "@/components/Metadata";
import Header from "@/components/layout/Header";

export default function HomePage() {
  return (
    <>
      <Metadata options={{
        title: 'Donate to Unnamed',
        description: 'Donate to Unnamed, an open-source software development team.',
        url: 'https://unnamed.team/donate'
      }} />

      <Header />

      <div className="flex flex-col items-center gap-4 my-10 p-8">
        <h1 className="text-white/80 font-medium text-6xl text-center">Donate to us!</h1>
        <p className="text-white/70 font-light text-lg text-center">
          You can donate to us via <a href="https://github.com/sponsors/yusshu">GitHub Sponsors</a>.
          After that, you can join our <a href="https://discord.gg/xbba2fy">Discord server</a> and get a special role!
          This will also prevent yusshu from stealing the team money &gt;:)
        </p>
      </div>
    </>
  );
};