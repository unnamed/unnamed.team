import Button from "@/components/Button";
import Header from "@/components/layout/Header";

export default function LandingHero() {
  return (
    <div>

      <Header />
        
      <div className="max-w-5xl mx-auto flex flex-col px-8 py-28 gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="flex flex-col gap-1.5">
            <span className="text-white/70 font-light text-xl sm:text-2xl md:text-3xl">Let&apos;s imagine, let&apos;s create</span>
            <span className="text-white/90 text-4xl sm:text-5xl md:text-6xl">We are <span className="text-pink-200">Unnamed Team</span></span>
          </h1>

          <p className="text-white/60 text-xl">
          </p>
        </div>

        <div className="flex flex-row text-lg gap-4">
          <Button label="Show me" href={`https://github.com/${process.env.githubSlug}`}/>
          <Button label="Join Us" href="/discord" color="secondary"/>
        </div>
      </div>
    </div>
  );
}