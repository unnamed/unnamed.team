import styles from './card.module.scss';

const layouts = {
  horizontal: styles.cardHorizontal,
  vertical: styles.cardVertical
};

export function CardContainer({ children }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}

export function Card({ children, layout, onClick }) {
  layout = layout || 'horizontal';
  return (
    <div className={`${styles.card} ${layouts[layout]}`} onClick={onClick}>
      {children}
    </div>
  );
}