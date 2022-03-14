import Link from 'next/link';

export default function Header({ children, className }) {
  return (
    <header className={`w-full ${className ?? ''}`}>
      <div className="flex flex-row justify-between max-w-8xl mx-auto py-4 px-8">

        <div className="flex flex-row items-center gap-2.5">
          <img className="h-[24px]" src="/logo.svg" alt="logo"/>
          <span className="leading-normal text-lg text-wine-900 dark:text-white">unnamed</span>
        </div>

        {children}

        <div className="flex flex-row items-center justify-between gap-12">
          {[
            [ '/', 'Home' ],
            [ '/docs', 'docs' ],
            [ '/project/glyphs', 'glyphs' ],
          ].map(([ path, id ]) => (
            <span key={id} className="capitalize font-medium text-sm text-wine-900 hover:text-pink-200 dark:text-white">
              <Link href={path}>{id}</Link>
            </span>
          ))}
        </div>

      </div>
    </header>
  );
}