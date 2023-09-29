import { UnnamedIcon } from "@/components/icons";
import Link from "next/link";
import YearRange from "@/components/text/YearRange";
import { DocProjects } from "@/lib/docs";

export default function Footer({ projects }: { projects: DocProjects }) {
  const docEntries = Object.entries(projects)
    .sort(([ , a ], [ , b ]) => b.stars - a.stars)
    .map(([ name, ]) => ([ name, `/docs/${name}` ]));
  while (docEntries.length > 6) { docEntries.pop(); }
  const content = {
    'Documentation': docEntries,
    'Web Projects': [
      [ 'Glyph Editor', '/project/glyphs' ],
      [ '404', '/thispagedoesntexist' ]
    ],
    'Community': [
      [ 'GitHub',`https://github.com/${process.env.githubSlug}` ],
      [ 'Discord', '/discord' ],
      [ 'X (Twitter)', 'https://twitter.com/unnamedteamd' ],
      [ 'YouTube', 'https://www.youtube.com/@unnamedteam3543' ],
      [ 'Mail', 'mailto:hello.w@unnamed.team' ],
    ],
  };
  return (
    <footer className="pt-12 pb-20">
      <div className="max-w-5xl mx-auto px-10 lg:px-0 flex flex-col">

        {/* Contents */}
        <div className="py-10">
          <div className="flex flex-row justify-start gap-16 flex-wrap">
            {Object.entries(content).map(([ title, entries ]) => (
              <div key={title} className="flex flex-col gap-1 text-white/50">
                <p className="font-medium my-1.5 text-white/70">{title}</p>
                {entries.map(([ label, href ]) => (
                  <Link href={href} key={href} className="hover:underline hover:underline-offset-2">{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t border-t-white/[.15] mt-8" />

        <div className="py-8 flex flex-col md:flex-row gap-3 justify-between">
          <Link href="/">
            <div className="flex flex-row items-center gap-2.5 cursor-pointer">
              <UnnamedIcon className="w-[24px] h-[24px] text-pink-200" />
              <span className="leading-normal text-lg text-white/90">unnamed</span>
            </div>
          </Link>

          <p className="text-white/40">
            Copyright &copy; <YearRange from={2019} /> Unnamed Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}