import Link from 'next/link';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import {DiscordIcon, GitHubIcon} from "@/components/icons";

export interface HeaderProps {
  children?: ReactNode;
  className?: string;
  banner?: ReactNode;
}

export default function Header({ children, className, banner }: HeaderProps) {

  const [ bannerVisible, setBannerVisible ] = useState(true);

  function closeBanner() {
    setBannerVisible(false);
  }

  return (
    <header className={clsx('w-full flex flex-col justify-center', className)}>
      {banner && bannerVisible && (
        <div className="w-full bg-pink-200">
          <div className="flex flex-row justify-between items-center max-w-5xl mx-auto py-2 px-8 text-sm text-black/80">
            {banner}
            {/* Close button */}
            <span className="cursor-pointer hover:text-white" onClick={closeBanner}>&#10006;</span>
          </div>
        </div>
      )}

      <div className="w-full flex flex-row justify-between max-w-5xl h-16 items-center mx-auto px-8">
        {/* Logo + Name */}
        <Link href="/">
          <div className="flex flex-row items-center gap-2.5 cursor-pointer">
            <img className="h-[24px]" src="/logo.svg" alt="logo"/>
            <span className="leading-normal text-lg text-white">unnamed</span>
          </div>
        </Link>

        {children}

        {/* Links */}
        <div className="flex-row items-center justify-between gap-12 hidden md:flex">
          {[
            [ '/', 'Home' ],
            [ '/projects', 'Projects' ],
          ].map(([ path, id ]) => (
            <span key={id} className="capitalize font-normal text-base text-white/80 hover:text-pink-200">
              <Link href={path}>{id}</Link>
            </span>
          ))}

          <span className="flex flex-row gap-4 items-center">
            <a href={`https://github.com/${process.env.githubSlug}/`} className="text-white/60 hover:text-white/80">
              <GitHubIcon />
            </a>
            <span className="text-white/60 hover:text-white/80 cursor-pointer">
              <Link href="/discord">
                <DiscordIcon />
              </Link>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}