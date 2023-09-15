import Button from "@/components/Button";
import Header from "@/components/layout/Header";
import Typewriter from "typewriter-effect";

export default function LandingHero() {
  return (
    <div>

      <Header />
        
      <div className="flex flex-row justify-between max-w-5xl mx-auto">
        <div className="flex flex-col px-8 py-28 gap-8">
          <div className="flex flex-col gap-6">
            <h1 className="flex flex-col gap-4">
              <span className="text-white text-4xl sm:text-5xl md:text-6xl">Let&apos;s imagine.</span>
              <span className="text-pink-200 text-4xl sm:text-5xl md:text-6xl">
                <Typewriter onInit={typewriter => {
                  typewriter.typeString('Let\'s create.')
                    .pauseFor(2500)
                    .deleteAll()
                    .typeString('Let\'s develop.')
                    .pauseFor(3000)
                    .deleteAll()
                    .typeString('Let\'s do open source.')
                    .start();
                }} />
              </span>
            </h1>

            <p className="text-white/80 text-md md:text-lg md:max-w-[50vw] lg:max-w-[35vw]">
              We are Unnamed Team, a software development team dedicated to
              open-source. We build libraries, applications and systems.
            </p>
          </div>

          <div className="flex flex-row text-lg gap-4">
            <Button label="Show me" href={`https://github.com/${process.env.githubSlug}`}/>
            <Button label="Join Us" href="/discord" color="secondary"/>
          </div>
        </div>

        <div>
        </div>
      </div>
    </div>
  );
}