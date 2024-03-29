import clsx from 'clsx';

const types = {
  primary: 'bg-pink-200 border border-white/30 text-black/80 hover:bg-pink-100',
  primaryGhost: 'bg-pink-200/10 border border-pink-200/[.15] text-pink-200/80 hover:bg-pink-200/20',
  secondary: 'bg-white/10 border border-white/[.30] text-white/80 hover:bg-white/0'
};

const sizes = {
  normal: 'rounded-2xl py-2 px-5 text-md font-medium shadow-lg',
  small: 'rounded-lg px-2 py-1 text-sm'
};

export interface ButtonProps {
  label: string;
  color?: keyof typeof types;
  size?: keyof typeof sizes;
  href?: string;
  className?: string;
  [ prop: string ]: any;
}

export default function Button({ label, color, size, href, className, ...props }: ButtonProps) {
  color = color || 'primary';
  size = size || 'normal';

  const btn = (
    <button
      className={clsx('font-normal', types[color], sizes[size], className)}
      {...props}>
      {label}
    </button>
  );

  return href ? (<a href={href}>{btn}</a>) : btn;
}