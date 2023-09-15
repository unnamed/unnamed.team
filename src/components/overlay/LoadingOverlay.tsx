import styles from "./LoadingOverlay.module.scss";

interface LoadingScreenProps {
    children?: any;
    heading?: string;
    description?: string;
}

export default function LoadingOverlay({ children, heading, description }: LoadingScreenProps) {
  return (
    <div className="top-0 left-0 right-0 bottom-0 fixed z-50 w-screen h-screen bg-cobalt">
      <div className="flex flex-row w-full h-full items-center">
        <div className="flex flex-col w-full items-center">
          <div className={styles.loader} />
          <h1 className="text-white/80 md:text-xl md:my-1">{heading ?? 'Loading...'}</h1>
          <p className="text-white/60 text-sm md:text-base">{description ?? 'This could take some seconds...'}</p>
          {children}
        </div>
      </div>
    </div>
  );
}