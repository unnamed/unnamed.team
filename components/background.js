import styles from './background.module.scss';

export function Background({ children }) {
  return (
    <div className={styles.background}>
      {children}
    </div>
  );
}