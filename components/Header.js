import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';

export default function Header({ children, className, banner }) {

  const [ bannerVisible, setBannerVisible ] = useState(true);

  function closeBanner() {
    setBannerVisible(false);
  }

  return (
    <header className={clsx('w-full flex flex-col', className)}>
      {banner && bannerVisible && (
        <div className="w-full bg-pink-200">
          <div className="flex flex-row justify-between items-center max-w-8xl mx-auto py-2 px-8 text-sm text-black/80">
            {banner}
            {/* Close button */}
            <span className="cursor-pointer hover:text-white" onClick={closeBanner}>&#10006;</span>
          </div>
        </div>
      )}

      <div className="w-full flex flex-row justify-between max-w-8xl mx-auto py-4 px-8">
        {/* Logo + Name */}
        <Link href="/">
          <div className="flex flex-row items-center gap-2.5 cursor-pointer">
            <img className="h-[24px]" src="/logo.svg" alt="logo"/>
            <span className="leading-normal text-lg text-white">unnamed</span>
          </div>
        </Link>

        {children}

        {/* Links */}
        <div className="flex flex-row items-center justify-between gap-12">
          {[
            [ '/', 'Home' ],
            [ '/projects', 'Projects' ]
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