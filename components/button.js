import styles from './button.module.scss';

const classes = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary
};

export function Button({ label, color, onClick }) {
  color = color || 'primary';
  return (
    <button
      className={`${styles.button} ${classes[color]}`}
      onClick={onClick}>
      {label}
    </button>
  );
}