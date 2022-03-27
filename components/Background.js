import clsx from 'clsx';

export default function Background({ children, className }) {
  return (
    <div className={clsx('min-h-screen bg-wine-900', className)}>
      {children}
    </div>
  );
}