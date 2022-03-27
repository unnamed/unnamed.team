import Link from 'next/link';
import clsx from 'clsx';

export default function Header({ children, className }) {
  return (
    <header className={clsx('w-full', className)}>
      <div className="flex flex-row justify-between max-w-8xl mx-auto py-4 px-8">

        {/* Logo + Name */}
        <div className="flex flex-row items-center gap-2.5">
          <img className="h-[24px]" src="/logo.svg" alt="logo"/>
          <span className="leading-normal text-lg text-white">unnamed</span>
        </div>

        {children}

        {/* Links */}
        <div className="flex flex-row items-center justify-between gap-12">
          {[
            [ '/', 'Home' ],
            [ '/docs', 'docs' ],
            [ '/project/glyphs', 'glyphs' ],
          ].map(([ path, id ]) => (
            <span key={id} className="capitalize font-normal text-base text-white/80 hover:text-pink-200">
              <Link href={path}>{id}</Link>
            </span>
          ))}
        </div>

      </div>
    </header>
  );
}